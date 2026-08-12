"use server";

import { createClient } from "@supabase/supabase-js";

export interface DemoInquiryPayload {
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  service: string;
  requirement?: string;
  preferredDate?: string;
  preferredTime?: string;
  source?: string;
}

export interface DemoInquiryResponse {
  success: boolean;
  message: string;
  whatsappUrl?: string;
  error?: string;
}

/**
 * Validates and processes a new "Get a Demo" inquiry lead.
 * Persists lead data, triggers external webhook (Google Sheets / CRM if configured),
 * and generates a pre-formatted WhatsApp link for instant continuation.
 */
export async function submitDemoInquiry(
  payload: DemoInquiryPayload
): Promise<DemoInquiryResponse> {
  try {
    const {
      fullName,
      companyName = "",
      phone,
      email,
      service,
      requirement = "",
      preferredDate = "",
      preferredTime = "",
      source = "website_hero"
    } = payload;

    // 1. Basic Server-side Validation
    if (!fullName || !fullName.trim()) {
      return { success: false, message: "Validation Error", error: "Full Name is required." };
    }

    if (!phone || !phone.trim()) {
      return { success: false, message: "Validation Error", error: "Phone number is required." };
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return { success: false, message: "Validation Error", error: "Valid email address is required." };
    }

    if (!service || !service.trim()) {
      return { success: false, message: "Validation Error", error: "Please select a service interested in." };
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCompany = companyName.trim() || "Not specified";
    const cleanReq = requirement.trim() || "None specified";
    const cleanDate = preferredDate || "As soon as possible";
    const cleanTime = preferredTime || "Anytime";
    const timestamp = new Date().toISOString();

    const leadRecord = {
      full_name: cleanName,
      company_name: cleanCompany,
      phone: cleanPhone,
      email: cleanEmail,
      service: service,
      requirement: cleanReq,
      preferred_date: cleanDate,
      preferred_time: cleanTime,
      source: source,
      created_at: timestamp
    };

    // 2. Persist to Supabase demo_inquiries table (if credentials present)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      try {
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { error: dbErr } = await adminClient
          .from("demo_inquiries")
          .insert([leadRecord]);

        if (dbErr) {
          console.warn("[submitDemoInquiry] Supabase lead insertion notice:", dbErr.message);
        } else {
          console.log("[submitDemoInquiry] Successfully recorded lead in Supabase demo_inquiries table.");
        }
      } catch (err: any) {
        console.warn("[submitDemoInquiry] Non-fatal Supabase insertion error:", err?.message || err);
      }
    }

    // 3. Post to Google Sheet / Webhook URL if configured in env
    const webhookUrl = process.env.DEMO_LEADS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadRecord)
        });
        console.log("[submitDemoInquiry] Successfully forwarded lead to Webhook/Google Sheet.");
      } catch (err: any) {
        console.warn("[submitDemoInquiry] Failed to forward lead to webhook:", err?.message || err);
      }
    }

    // 4. Generate formatted WhatsApp message URL
    const whatsappReceiverNumber = (
      process.env.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER ||
      process.env.DEMO_WHATSAPP_NUMBER ||
      "919876543210"
    ).replace(/[^0-9]/g, "");

    const formattedMessage = [
      `*New Demo Inquiry - GAP VoicePilot*`,
      ``,
      `*Name:* ${cleanName}`,
      `*Company:* ${cleanCompany}`,
      `*Phone:* ${cleanPhone}`,
      `*Email:* ${cleanEmail}`,
      `*Service Interested:* ${service}`,
      `*Requirement:* ${cleanReq}`,
      `*Preferred Demo:* ${cleanDate} at ${cleanTime}`,
      `*Source:* ${source}`
    ].join("\n");

    const encodedMessage = encodeURIComponent(formattedMessage);
    const whatsappUrl = `https://wa.me/${whatsappReceiverNumber}?text=${encodedMessage}`;

    return {
      success: true,
      message: "Your demo request has been received.",
      whatsappUrl
    };
  } catch (error: any) {
    console.error("[submitDemoInquiry] Unexpected error submitting lead:", error);
    return {
      success: false,
      message: "Submission failed",
      error: error?.message || "An unexpected error occurred while saving your request. Please try again."
    };
  }
}
