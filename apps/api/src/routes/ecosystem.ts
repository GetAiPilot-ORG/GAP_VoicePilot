import { Router, Request, Response } from 'express';
import { planCheckMiddleware } from '../middleware/planCheck';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { supabaseAdmin as supabase } from '../config/supabase';

export const ecosystemRouter = Router();
const voiceProvider = new VomyraClient();

// Endpoint for bot-dashboard to trigger an automated AI Voice call fallback
// Requires headers: { 'x-ecosystem-secret': process.env.VOMYRA_BRIDGE_SECRET }
ecosystemRouter.post('/trigger-call', planCheckMiddleware, async (req: Request, res: Response) => {
    try {
        const secret = req.headers['x-ecosystem-secret'];
        if (secret !== process.env.VOMYRA_BRIDGE_SECRET) {
            return res.status(401).json({ error: 'Unauthorized ecosystem request' });
        }

        const { org_id, user_email, lead_id, phone, agent_id, variables } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        console.log(`[ECOSYSTEM] Triggering AI Voice Follow-up for lead ${lead_id} (Org: ${org_id}) to ${phone}`);

        let targetWorkspaceIds = [org_id];
        
        // Match user's CRM email to VoicePilot workspace
        if (user_email) {
            try {
                let matchedUser = null;
                let page = 1;
                while (!matchedUser) {
                    const { data: users, error: userError } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
                    if (userError || !users || users.users.length === 0) break;
                    matchedUser = users.users.find(u => u.email === user_email);
                    if (matchedUser) break;
                    page++;
                }
                
                if (matchedUser) {
                    const { data: userWorkspaces } = await supabase
                        .from('workspaces')
                        .select('id')
                        .eq('owner_id', matchedUser.id);
                    if (userWorkspaces && userWorkspaces.length > 0) {
                        targetWorkspaceIds = userWorkspaces.map(w => w.id);
                        console.log(`[ECOSYSTEM] Mapped CRM email ${user_email} to VoicePilot workspaces:`, targetWorkspaceIds);
                    }
                }
            } catch (e) {
                console.warn("[ECOSYSTEM] Failed to map email to workspace:", e);
            }
        }

        // 1. Try to fetch user's assigned Vomyra phone number first (Best approach for Vomyra)
        let { data: phoneData } = await supabase
          .from('phone_numbers')
          .select('phone_number, assigned_assistant_id')
          .in('workspace_id', targetWorkspaceIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        let assigned_number = null;
        let vomyra_assistant_id = null;

        const linkedPhone = phoneData?.find(p => p.assigned_assistant_id);
        if (linkedPhone) {
            assigned_number = linkedPhone.phone_number;
            vomyra_assistant_id = linkedPhone.assigned_assistant_id;
        } else if (phoneData && phoneData.length > 0) {
            assigned_number = phoneData[0].phone_number;
        }

        let callResponse = null;
        let success = false;
        let lastError = null;

        if (assigned_number) {
            console.log(`[ECOSYSTEM] Trying REAL Vomyra call with assigned_number=${assigned_number}`);
            try {
                callResponse = await voiceProvider.initiateCall({
                   customer_number: phone,
                   customer_name: variables?.name || 'Customer',
                   additional_data: { source: 'GAP_Ecosystem', lead_id },
                   assigned_number: assigned_number
                });
                success = true;
            } catch (err: any) {
                console.log(`[ECOSYSTEM] Call with assigned_number failed: ${err.message}`);
                lastError = err;
            }
        }

        // 2. Fallback: Try all assistants if phone number failed or didn't exist
        if (!success) {
            let { data: assistantData } = await supabase
              .from('assistants')
              .select('provider_resource_id')
              .in('workspace_id', targetWorkspaceIds)
              .eq('provider', 'vomyra')
              .eq('status', 'active')
              .order('updated_at', { ascending: false });

            if (!assistantData || assistantData.length === 0) {
               console.error("[ECOSYSTEM] No VoicePilot phone number or assistant configured in the system for this user.");
               return res.status(400).json({ error: 'No VoicePilot configuration found for this user' });
            }

            for (const ast of assistantData) {
                const vomyra_assistant_id = ast.provider_resource_id;
                if (!vomyra_assistant_id) continue;

                console.log(`[ECOSYSTEM] Trying REAL Vomyra call with assistant_id=${vomyra_assistant_id}`);
                try {
                    callResponse = await voiceProvider.initiateCall({
                       customer_number: phone,
                       customer_name: variables?.name || 'Customer',
                       additional_data: { source: 'GAP_Ecosystem', lead_id },
                       assistant_id: vomyra_assistant_id
                    });
                    success = true;
                    break;
                } catch (err: any) {
                    lastError = err;
                    console.log(`[ECOSYSTEM] Assistant ${vomyra_assistant_id} failed: ${err.message}`);
                }
            }
        }

        if (!success) {
            throw lastError || new Error("Failed to place call with any available configuration");
        }

        // --- BACKGROUND POLLING: Auto-sync CRM without requiring webhooks ---
        if (callResponse && callResponse.id) {
            const callId = callResponse.id;
            console.log(`[ECOSYSTEM] Starting background polling for call ${callId}`);
            
            (async () => {
                let attempts = 0;
                let postCallWait = 0;
                const maxAttempts = 30; // 30 * 10s = 5 minutes timeout
                
                while (attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 10000)); // wait 10 seconds
                    attempts++;
                    try {
                        const callStatusResponse = await voiceProvider.getCall(callId);
                        // Vomyra API wrapper returns either { data: {...} } or the direct object
                        const callStatus = callStatusResponse.data || callStatusResponse;
                        
                        // Since Vomyra populates call_end_time immediately with a dummy value, we shouldn't rely on it alone.
                        // We consider the call fully processed if it has a whatsapp_summary OR if we've polled for 120 seconds.
                        const hasSummary = !!callStatus.whatsapp_summary || !!callStatus.notes;
                        const hasRealTranscript = callStatus.transcript && callStatus.transcript.some((t: any) => t.role !== 'system');
                        const isProbablyFinished = hasSummary || (callStatus.call_duration !== '00:00:00' && callStatus.call_duration);
                        
                        if (!hasSummary && attempts < 12) { // Poll for up to 120 seconds (2 mins) waiting for summary
                            console.log(`[ECOSYSTEM] Call ${callId} ongoing or waiting for AI summary (attempt ${attempts}/12)...`);
                            continue; // keep polling
                        }

                            const debugLog = (msg: string) => {
                                try { require('fs').appendFileSync(require('path').join(__dirname, 'debug.log'), new Date().toISOString() + ': ' + msg + '\n'); } catch (e) {}
                            };
                            debugLog(`Call ${callId} completed. Vomyra payload: ${JSON.stringify(callStatus)}`);
                            console.log(`[ECOSYSTEM] Call ${callId} completed and processed. Updating CRM...`);
                            
                            // Load CRM credentials
                            const path = require('path');
                            const dotenv = require('dotenv');
                            const { createClient } = require('@supabase/supabase-js');
                            const crmEnvPath = path.resolve(__dirname, '../../../../../bot-dashboard/getaipilot.online/.env');
                            const crmEnv = dotenv.config({ path: crmEnvPath }).parsed;
                            
                            if (crmEnv && crmEnv.VITE_SUPABASE_URL) {
                                const crmSupabase = createClient(crmEnv.VITE_SUPABASE_URL, crmEnv.VITE_SUPABASE_ANON_KEY);
                                
                                let extractedNotes = 'Call Completed via VoicePilot\n';
                                
                                // Extract structured data if Vomyra provided it
                                if (callStatus.variables && Object.keys(callStatus.variables).length > 0) {
                                    extractedNotes += '\n--- Extracted Details ---\n';
                                    for (const [key, val] of Object.entries(callStatus.variables)) {
                                        extractedNotes += `${key}: ${val}\n`;
                                    }
                                } else if (callStatus.extracted_data && Object.keys(callStatus.extracted_data).length > 0) {
                                    extractedNotes += '\n--- Extracted Details ---\n';
                                    for (const [key, val] of Object.entries(callStatus.extracted_data)) {
                                        extractedNotes += `${key}: ${val}\n`;
                                    }
                                }

                                if (callStatus.notes) {
                                    extractedNotes += `\n--- AI Summary ---\n${callStatus.notes}\n`;
                                }
                                if (callStatus.whatsapp_summary) {
                                    extractedNotes += `\n--- Actionable Summary ---\n${callStatus.whatsapp_summary}\n`;
                                    
                                    // Smart Extraction for CRM
                                    const s = callStatus.whatsapp_summary.toLowerCase();
                                    let service = "General Inquiry";
                                    if (s.includes('website')) service = "Website Development";
                                    if (s.includes('marketing')) service = "Digital Marketing";
                                    if (s.includes('dentist') || s.includes('dental')) service += " (Dental)";
                                    if (s.includes('real estate')) service += " (Real Estate)";
                                    
                                    let budget = "To be discussed";
                                    let budgetMatch = callStatus.whatsapp_summary.match(/((?:rs\.?|inr|₹|\$)\s*\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)/i);
                                    if (!budgetMatch) budgetMatch = callStatus.whatsapp_summary.match(/(\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)\s*(?:budget|cost|price|rupees|rs)/i);
                                    if (!budgetMatch) budgetMatch = callStatus.whatsapp_summary.match(/(?:budget|price|cost).*?(\d+(?:,\d+)*(?:\.\d+)?(?:k|m|lakh|thousand)?)/i);
                                    if (budgetMatch) budget = budgetMatch[1];
                                    if (budget && !budget.match(/rs|inr|₹|\$/i) && budget !== 'To be discussed') budget = '₹' + budget;
                                    
                                    let timeline = "Not specified";
                                    if (s.includes('urgent') || s.includes('asap') || s.includes('immediate')) timeline = "Immediate";
                                    else if (s.includes('next week') || s.includes('1 week') || s.includes('a week')) timeline = "Next Week";
                                    else if (s.includes('week')) timeline = "Within a week";
                                    else if (s.includes('month')) timeline = "Within a month";
                                    
                                    extractedNotes += `\n--- Extracted Insights ---\nService: ${service}\nBudget: ${budget}\nTimeline: ${timeline}\n`;
                                }

                                // Update CRM
                                await crmSupabase
                                  .from('crm_contacts')
                                  .update({ status: 'customer', notes: extractedNotes })
                                  .eq('id', lead_id);
                                  
                                console.log(`[ECOSYSTEM] Successfully synced call ${callId} to CRM lead ${lead_id}.`);
                            }
                            break; // exit polling loop
                    } catch (pollErr) {
                        console.error(`[ECOSYSTEM] Polling error for ${callId}:`, pollErr);
                    }
                }
            })().catch(e => console.error("Polling crash:", e));
        }
        // --------------------------------------------------------------------

        return res.status(200).json({ 
            success: true, 
            message: 'AI Voice automated action triggered successfully',
            details: {
                phone,
                call_data: callResponse,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[ECOSYSTEM] Error in trigger-call:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
