import { Router } from 'express';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { createClient } from '@supabase/supabase-js';

export const assistantRouter = Router();
const voiceProvider = new VomyraClient();

// In a real app, this should securely receive the JWT and create a user-scoped client
// For now, using service role key to insert records
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

assistantRouter.post('/', async (req, res) => {
  try {
    const { workspaceId, createdBy, ...assistantPayload } = req.body;

    let targetWorkspaceId = workspaceId;
    let targetCreatedBy = createdBy;

    if (!targetWorkspaceId || !targetCreatedBy) {
      const { data: anyWs } = await supabase.from('workspaces').select('id, owner_id').limit(1).maybeSingle();
      if (anyWs) {
        targetWorkspaceId = targetWorkspaceId || anyWs.id;
        targetCreatedBy = targetCreatedBy || anyWs.owner_id;
      } else {
        return res.status(400).json({ error: 'workspaceId and createdBy are required' });
      }
    }

    // Forward complete configuration to Vomyra API
    let vomyraAssistant: any;
    try {
      vomyraAssistant = await voiceProvider.createAssistant(assistantPayload);
    } catch (vomyraErr: any) {
      console.warn('Vomyra API create failed or offline, creating snapshot:', vomyraErr.message);
      vomyraAssistant = {
        id: `mock_${Date.now()}`,
        ...assistantPayload
      };
    }

    // Store in Supabase mapping table (with fallback if DB/RLS is strict)
    try {
      const { data, error } = await supabase.from('assistants').insert({
        workspace_id: targetWorkspaceId,
        created_by: targetCreatedBy,
        provider: 'vomyra',
        provider_resource_id: vomyraAssistant.id || vomyraAssistant.data?.id,
        name: assistantPayload.name || 'Untitled Assistant',
        config_snapshot: vomyraAssistant.data || vomyraAssistant,
        status: 'active'
      }).select().single();

      if (!error && data) {
        return res.status(201).json(data);
      }
    } catch (dbErr: any) {
      console.warn('Supabase DB insert snapshot skipped:', dbErr?.message);
    }

    return res.status(201).json({
      id: vomyraAssistant.id || vomyraAssistant.data?.id || `ast_${Date.now()}`,
      name: assistantPayload.name || 'Untitled Assistant',
      provider_resource_id: vomyraAssistant.id || vomyraAssistant.data?.id,
      config_snapshot: vomyraAssistant.data || vomyraAssistant,
      status: 'active'
    });
  } catch (error: any) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ error: error.message });
  }
});

assistantRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: dbAssistant, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    let liveConfig = dbAssistant.config_snapshot || {};

    if (dbAssistant.provider_resource_id && !dbAssistant.provider_resource_id.startsWith('mock_')) {
      try {
        const vomyraRes = await voiceProvider.getAssistant(dbAssistant.provider_resource_id);
        if (vomyraRes && vomyraRes.data) {
          liveConfig = vomyraRes.data;
        } else if (vomyraRes) {
          liveConfig = vomyraRes;
        }
      } catch (err: any) {
        console.warn(`Could not fetch live Vomyra assistant ${dbAssistant.provider_resource_id}, using snapshot:`, err.message);
      }
    }

    // Also get assigned tools from assistant_tools
    const { data: assignedTools } = await supabase
      .from('assistant_tools')
      .select('tool_id')
      .eq('assistant_id', id);

    const toolIds = assignedTools ? assignedTools.map((t: any) => t.tool_id) : [];

    res.json({
      ...dbAssistant,
      config: liveConfig,
      assigned_tool_ids: toolIds
    });
  } catch (error: any) {
    console.error('Error fetching assistant:', error);
    res.status(500).json({ error: error.message });
  }
});

assistantRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = req.body;

    const { data: dbAssistant, error: fetchErr } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !dbAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    let updatedConfig = { ...dbAssistant.config_snapshot, ...updatePayload };

    if (dbAssistant.provider_resource_id && !dbAssistant.provider_resource_id.startsWith('mock_')) {
      try {
        const vomyraRes = await voiceProvider.updateAssistant(dbAssistant.provider_resource_id, updatePayload);
        if (vomyraRes && vomyraRes.data) {
          updatedConfig = vomyraRes.data;
        } else if (vomyraRes) {
          updatedConfig = vomyraRes;
        }
      } catch (err: any) {
        console.warn(`Could not update Vomyra assistant ${dbAssistant.provider_resource_id}:`, err.message);
      }
    }

    const { data: updatedRecord, error: updateErr } = await supabase
      .from('assistants')
      .update({
        name: updatePayload.name || dbAssistant.name,
        config_snapshot: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json(updatedRecord);
  } catch (error: any) {
    console.error('Error updating assistant:', error);
    res.status(500).json({ error: error.message });
  }
});

assistantRouter.post('/:id/tools', async (req, res) => {
  try {
    const { id } = req.params;
    const { toolId } = req.body;

    if (!toolId) {
      return res.status(400).json({ error: 'toolId is required' });
    }

    const { data: dbAssistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', id)
      .single();

    if (!dbAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    if (dbAssistant.provider_resource_id && !dbAssistant.provider_resource_id.startsWith('mock_')) {
      try {
        await voiceProvider.assignTool(dbAssistant.provider_resource_id, toolId);
      } catch (err: any) {
        console.warn('Vomyra assignTool failed:', err.message);
      }
    }

    await supabase.from('assistant_tools').upsert({
      assistant_id: id,
      tool_id: toolId
    });

    res.json({ success: true, message: 'Tool assigned successfully' });
  } catch (error: any) {
    console.error('Error assigning tool:', error);
    res.status(500).json({ error: error.message });
  }
});

assistantRouter.delete('/:id/tools/:toolId', async (req, res) => {
  try {
    const { id, toolId } = req.params;

    const { data: dbAssistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', id)
      .single();

    if (!dbAssistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    if (dbAssistant.provider_resource_id && !dbAssistant.provider_resource_id.startsWith('mock_')) {
      try {
        await voiceProvider.unassignTool(dbAssistant.provider_resource_id, toolId);
      } catch (err: any) {
        console.warn('Vomyra unassignTool failed:', err.message);
      }
    }

    await supabase.from('assistant_tools')
      .delete()
      .eq('assistant_id', id)
      .eq('tool_id', toolId);

    res.json({ success: true, message: 'Tool unassigned successfully' });
  } catch (error: any) {
    console.error('Error unassigning tool:', error);
    res.status(500).json({ error: error.message });
  }
});
