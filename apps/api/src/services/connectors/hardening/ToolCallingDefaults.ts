// ============================================================
// VoicePilot Tool Calling Defaults — Server-Side Ground Truth
// Mirrors apps/web/lib/toolCallingDefaults.ts exactly.
// Used by the API test endpoint and tool hardening logic.
// ============================================================

export type ToolCategory = 'READ' | 'WRITE' | 'DESTRUCTIVE';
export type ExecutionCapability = 'during_call' | 'workflow';
export type ExecutionPolicy = 'allow' | 'confirm' | 'disabled';

export interface ToolCallingConfig {
  tool_name: string;
  tool_title: string;
  provider: 'gmail' | 'slack' | string;
  category: ToolCategory;
  execution_capabilities: ExecutionCapability[];
  when_to_use: string;
  requires_confirmation: boolean;
  allowed_during_call: boolean;
  timeout_ms: number;
  failure_message: string;
  required_scopes: string[];
  is_destructive?: boolean;
}

/** Derived execution_policy for use in connector_tool_permissions table */
export function deriveExecutionPolicy(category: ToolCategory): ExecutionPolicy {
  if (category === 'READ') return 'allow';
  return 'confirm'; // WRITE and DESTRUCTIVE always require confirmation
}

export const TOOL_CALLING_DEFAULTS: Record<string, ToolCallingConfig> = {

  // ==========================================
  // 1. GMAIL TOOLS
  // ==========================================
  'gmail.search_email': {
    tool_name: 'gmail.search_email',
    tool_title: 'Search Gmail Messages',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks you to find, search, locate, or check emails in the connected Gmail account. Build a concise Gmail search query from the caller's request. Do not use it for sending or modifying emails.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search the email account right now. Please try again in a moment.",
    required_scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'gmail.readonly']
  },
  'gmail.get_email': {
    tool_name: 'gmail.get_email',
    tool_title: 'Get Email Details',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller wants the details or content of a specific email that has already been identified. Prefer using search_email first if the exact message is not known.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't retrieve that email right now.",
    required_scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'gmail.readonly']
  },
  'gmail.create_draft': {
    tool_name: 'gmail.create_draft',
    tool_title: 'Create Email Draft',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller explicitly asks you to prepare or save an email draft without sending it. Confirm important recipient, subject, and message details if they are ambiguous.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the email draft right now.",
    required_scopes: ['https://www.googleapis.com/auth/gmail.compose', 'gmail.compose']
  },
  'gmail.send_email': {
    tool_name: 'gmail.send_email',
    tool_title: 'Send Email Directly',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool only when the caller explicitly asks to send an email. Before execution, confirm the recipient and the essential message content. Never send an email based only on an inferred intention.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't send the email right now. No email was sent.",
    required_scopes: ['https://www.googleapis.com/auth/gmail.compose', 'gmail.compose'],
    is_destructive: true
  },

  // ==========================================
  // 2. GOOGLE CALENDAR TOOLS
  // ==========================================
  'google_calendar.check_availability': {
    tool_name: 'google_calendar.check_availability',
    tool_title: 'Check Calendar Availability',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller asks whether a date or time is available, asks for free slots, or wants to schedule an appointment.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't check the calendar right now.",
    required_scopes: ['https://www.googleapis.com/auth/calendar.events', 'calendar.events']
  },
  'google_calendar.list_events': {
    tool_name: 'google_calendar.list_events',
    tool_title: 'List Calendar Events',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller asks to check upcoming appointments, meetings, or schedule on Google Calendar.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't list calendar events right now.",
    required_scopes: ['https://www.googleapis.com/auth/calendar.events', 'calendar.events']
  },
  'google_calendar.create_event': {
    tool_name: 'google_calendar.create_event',
    tool_title: 'Create Calendar Event',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use when the caller explicitly wants to book, schedule, or create an appointment or calendar event. Confirm the final date, time, timezone, and attendee details before creating it.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the calendar event right now. Nothing was booked.",
    required_scopes: ['https://www.googleapis.com/auth/calendar.events', 'calendar.events']
  },
  'google_calendar.cancel_event': {
    tool_name: 'google_calendar.cancel_event',
    tool_title: 'Cancel Calendar Event',
    provider: 'gmail',
    category: 'DESTRUCTIVE',
    execution_capabilities: ['during_call'],
    when_to_use: "Use only when the caller explicitly requests changing or cancelling an existing calendar event. Identify the correct event first and confirm the requested change before execution.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't cancel the calendar event right now.",
    required_scopes: ['https://www.googleapis.com/auth/calendar.events', 'calendar.events'],
    is_destructive: true
  },

  // ==========================================
  // 3. GOOGLE CONTACTS TOOLS
  // ==========================================
  'google_contacts.search_contacts': {
    tool_name: 'google_contacts.search_contacts',
    tool_title: 'Search Google Contacts',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller asks to look up or find a contact's phone number, email address, or contact details.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't find that contact right now.",
    required_scopes: ['https://www.googleapis.com/auth/contacts', 'contacts']
  },
  'google_contacts.get_contact': {
    tool_name: 'google_contacts.get_contact',
    tool_title: 'Get Contact Profile',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller wants detailed profile info for a specific contact.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't retrieve that contact right now.",
    required_scopes: ['https://www.googleapis.com/auth/contacts', 'contacts']
  },
  'google_contacts.create_contact': {
    tool_name: 'google_contacts.create_contact',
    tool_title: 'Create Contact Record',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use when the caller explicitly requests adding a new contact. Clearly confirm name, phone, and email before saving.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the contact right now.",
    required_scopes: ['https://www.googleapis.com/auth/contacts', 'contacts']
  },
  'google_contacts.update_contact': {
    tool_name: 'google_contacts.update_contact',
    tool_title: 'Update Contact Record',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use when the caller explicitly requests updating an existing contact's details. Clearly identify the contact and confirm changes before saving.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the contact right now.",
    required_scopes: ['https://www.googleapis.com/auth/contacts', 'contacts']
  },

  // ==========================================
  // 4. GOOGLE DRIVE TOOLS
  // ==========================================
  'google_drive.search_files': {
    tool_name: 'google_drive.search_files',
    tool_title: 'Search Drive Files',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller asks to search or locate files and documents in Google Drive.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't access Drive files right now.",
    required_scopes: ['https://www.googleapis.com/auth/drive.file', 'drive.file']
  },
  'google_drive.get_file_metadata': {
    tool_name: 'google_drive.get_file_metadata',
    tool_title: 'Get Drive File Metadata',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller needs details, links, or size information for a specific Drive file.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't retrieve file information right now.",
    required_scopes: ['https://www.googleapis.com/auth/drive.file', 'drive.file']
  },

  // ==========================================
  // 5. GOOGLE SHEETS TOOLS
  // ==========================================
  'google_sheets.read_spreadsheet': {
    tool_name: 'google_sheets.read_spreadsheet',
    tool_title: 'Read Spreadsheet Data',
    provider: 'gmail',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller asks to look up or read tabular data from a configured Google Sheet. Target spreadsheet must be determined by workspace settings.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't read the spreadsheet right now.",
    required_scopes: ['https://www.googleapis.com/auth/spreadsheets', 'spreadsheets']
  },
  'google_sheets.append_row': {
    tool_name: 'google_sheets.append_row',
    tool_title: 'Append Spreadsheet Row',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use when the caller wants to record, log, or append structured data to a Google Sheet. Confirm data row values before writing.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't write to the spreadsheet right now.",
    required_scopes: ['https://www.googleapis.com/auth/spreadsheets', 'spreadsheets']
  },
  'google_sheets.update_cell': {
    tool_name: 'google_sheets.update_cell',
    tool_title: 'Update Spreadsheet Cell',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use when the caller asks to update specific cell values in a Google Sheet. Confirm target cell and values before updating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the spreadsheet right now.",
    required_scopes: ['https://www.googleapis.com/auth/spreadsheets', 'spreadsheets']
  },

  // ==========================================
  // 6. GOOGLE MEET TOOLS
  // ==========================================
  'google_meet.create_space': {
    tool_name: 'google_meet.create_space',
    tool_title: 'Create Google Meet Link',
    provider: 'gmail',
    category: 'WRITE',
    execution_capabilities: ['during_call'],
    when_to_use: "Use when the caller requests an instant video meeting link for Google Meet.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't generate a Google Meet link right now.",
    required_scopes: ['https://www.googleapis.com/auth/meetings.space.created', 'meetings.space.created']
  },

  // ==========================================
  // 7. SLACK TOOLS
  // ==========================================
  'slack.list_channels': {
    tool_name: 'slack.list_channels',
    tool_title: 'List Slack Channels',
    provider: 'slack',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks what Slack channels are available, needs help finding a channel, or when another Slack action requires selecting the correct channel first.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't list the Slack channels right now.",
    required_scopes: ['channels:read', 'groups:read']
  },
  'slack.search_messages': {
    tool_name: 'slack.search_messages',
    tool_title: 'Search Slack Messages',
    provider: 'slack',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to find a Slack message, discussion, update, person mention, or topic across accessible Slack channels.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search Slack messages right now.",
    required_scopes: ['channels:history', 'groups:history']
  },
  'slack.send_message': {
    tool_name: 'slack.send_message',
    tool_title: 'Send Slack Message',
    provider: 'slack',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool only when the caller explicitly asks you to send a Slack message. Confirm the destination channel or recipient and the essential message content before sending.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't send the Slack message right now. No message was sent.",
    required_scopes: ['chat:write', 'chat:write.public'],
    is_destructive: true
  },

  // ==========================================
  // 8. HUBSPOT CRM TOOLS
  // ==========================================
  'hubspot.search_contacts': {
    tool_name: 'hubspot.search_contacts',
    tool_title: 'Search HubSpot Contacts',
    provider: 'hubspot',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks you to find, search, or look up contact records, phone numbers, emails, or company details in HubSpot CRM.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search HubSpot CRM contacts right now. Please try again in a moment.",
    required_scopes: ['crm.objects.contacts.read']
  },
  'hubspot.get_contact': {
    tool_name: 'hubspot.get_contact',
    tool_title: 'Get HubSpot Contact Details',
    provider: 'hubspot',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks for detailed profile information, company, or history for a specific HubSpot contact ID or email.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't retrieve that HubSpot contact profile right now.",
    required_scopes: ['crm.objects.contacts.read']
  },
  'hubspot.create_contact': {
    tool_name: 'hubspot.create_contact',
    tool_title: 'Create HubSpot Contact',
    provider: 'hubspot',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller explicitly asks to create, register, or save a new contact record in HubSpot CRM. Confirm contact name, email, or phone number before creating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the contact record in HubSpot CRM right now.",
    required_scopes: ['crm.objects.contacts.write']
  },
  'hubspot.create_engagement': {
    tool_name: 'hubspot.create_engagement',
    tool_title: 'Log HubSpot Call Note / Engagement',
    provider: 'hubspot',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller requests saving a meeting note, call summary, or engagement record on a contact's timeline in HubSpot CRM.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't log the engagement note in HubSpot CRM right now.",
    required_scopes: ['crm.objects.contacts.write']
  },

  // ==========================================
  // 9. NOTION WORKSPACE TOOLS
  // ==========================================
  'notion.search': {
    tool_name: 'notion.search',
    tool_title: 'Search Notion Workspace',
    provider: 'notion',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks you to find, search, or look up pages, documents, or databases in the connected Notion workspace.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search the Notion workspace right now.",
    required_scopes: []
  },
  'notion.get_page': {
    tool_name: 'notion.get_page',
    tool_title: 'Get Notion Page Content',
    provider: 'notion',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to read, inspect, or summarize content from a specific Notion page.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't retrieve that Notion page right now.",
    required_scopes: []
  },
  'notion.create_page': {
    tool_name: 'notion.create_page',
    tool_title: 'Create Notion Page',
    provider: 'notion',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller explicitly asks to create a new page, document, or record in Notion. Confirm page title and destination before creating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the Notion page right now.",
    required_scopes: []
  },
  'notion.update_page': {
    tool_name: 'notion.update_page',
    tool_title: 'Update Notion Page',
    provider: 'notion',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller explicitly asks to update the title or archive status of an existing Notion page. Confirm changes before execution.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the Notion page right now.",
    required_scopes: []
  },
  'notion.append_blocks': {
    tool_name: 'notion.append_blocks',
    tool_title: 'Append Blocks to Notion Page',
    provider: 'notion',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to log notes, append action items, or add meeting summaries to an existing Notion page.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't append blocks to the Notion page right now.",
    required_scopes: []
  },

  // ==========================================
  // 10. SALESFORCE CRM TOOLS
  // ==========================================
  'salesforce.search_contacts': {
    tool_name: 'salesforce.search_contacts',
    tool_title: 'Search Salesforce Contacts',
    provider: 'salesforce',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to search, find, or look up contact records in Salesforce CRM by name, email, or phone number.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search Salesforce contacts right now.",
    required_scopes: ['api']
  },
  'salesforce.get_contact': {
    tool_name: 'salesforce.get_contact',
    tool_title: 'Get Salesforce Contact Details',
    provider: 'salesforce',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks for detailed profile information for a specific Salesforce Contact ID.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't retrieve that Salesforce contact profile right now.",
    required_scopes: ['api']
  },
  'salesforce.create_contact': {
    tool_name: 'salesforce.create_contact',
    tool_title: 'Create Salesforce Contact',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller explicitly asks to create a new Contact record in Salesforce CRM. Confirm contact name and email before creating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the Salesforce contact right now.",
    required_scopes: ['api']
  },
  'salesforce.update_contact': {
    tool_name: 'salesforce.update_contact',
    tool_title: 'Update Salesforce Contact',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to update contact details in Salesforce CRM. Confirm changes before execution.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the Salesforce contact right now.",
    required_scopes: ['api']
  },
  'salesforce.search_leads': {
    tool_name: 'salesforce.search_leads',
    tool_title: 'Search Salesforce Leads',
    provider: 'salesforce',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to find or search for a Lead record in Salesforce CRM.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search Salesforce leads right now.",
    required_scopes: ['api']
  },
  'salesforce.create_lead': {
    tool_name: 'salesforce.create_lead',
    tool_title: 'Create Salesforce Lead',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to register a new lead or prospect in Salesforce CRM. Confirm company and contact name before creating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the Salesforce lead right now.",
    required_scopes: ['api']
  },
  'salesforce.update_lead': {
    tool_name: 'salesforce.update_lead',
    tool_title: 'Update Salesforce Lead',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to update lead status, rating, or details in Salesforce CRM.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the Salesforce lead right now.",
    required_scopes: ['api']
  },
  'salesforce.create_task': {
    tool_name: 'salesforce.create_task',
    tool_title: 'Create Salesforce Task / Call Log',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to log a completed call note, activity task, or follow-up item in Salesforce CRM.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the task in Salesforce CRM right now.",
    required_scopes: ['api']
  },
  'salesforce.create_note': {
    tool_name: 'salesforce.create_note',
    tool_title: 'Create Salesforce Note',
    provider: 'salesforce',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to attach a detailed note to a Salesforce record.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the note in Salesforce CRM right now.",
    required_scopes: ['api']
  },

  // ==========================================
  // 11. LINEAR ISSUE TRACKER TOOLS
  // ==========================================
  'linear.search_issues': {
    tool_name: 'linear.search_issues',
    tool_title: 'Search Linear Issues',
    provider: 'linear',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to search, find, or look up issues, bug reports, or tasks in Linear.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 8000,
    failure_message: "I couldn't search Linear issues right now.",
    required_scopes: ['read']
  },
  'linear.get_issue': {
    tool_name: 'linear.get_issue',
    tool_title: 'Get Linear Issue Details',
    provider: 'linear',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks for details, status, or assignee of a specific Linear issue identifier (e.g. ENG-123).",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't retrieve that Linear issue right now.",
    required_scopes: ['read']
  },
  'linear.create_issue': {
    tool_name: 'linear.create_issue',
    tool_title: 'Create Linear Issue',
    provider: 'linear',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to create a bug report, task, or ticket in Linear. Confirm team and issue title before creating.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't create the Linear issue right now.",
    required_scopes: ['write', 'issues:create']
  },
  'linear.update_issue': {
    tool_name: 'linear.update_issue',
    tool_title: 'Update Linear Issue',
    provider: 'linear',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to update the title, status, or description of an existing Linear issue. Confirm changes before execution.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't update the Linear issue right now.",
    required_scopes: ['write']
  },
  'linear.add_comment': {
    tool_name: 'linear.add_comment',
    tool_title: 'Add Comment to Linear Issue',
    provider: 'linear',
    category: 'WRITE',
    execution_capabilities: ['during_call', 'workflow'],
    when_to_use: "Use this tool when the caller asks to post a comment, meeting note, or update to a Linear issue.",
    requires_confirmation: true,
    allowed_during_call: true,
    timeout_ms: 10000,
    failure_message: "I couldn't add the comment to the Linear issue right now.",
    required_scopes: ['write', 'comments:create']
  },
  'linear.list_teams': {
    tool_name: 'linear.list_teams',
    tool_title: 'List Linear Teams',
    provider: 'linear',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks what teams or departments exist in Linear.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't list Linear teams right now.",
    required_scopes: ['read']
  },
  'linear.list_projects': {
    tool_name: 'linear.list_projects',
    tool_title: 'List Linear Projects',
    provider: 'linear',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks to list active projects in Linear.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 6000,
    failure_message: "I couldn't list Linear projects right now.",
    required_scopes: ['read']
  },
  'linear.get_viewer': {
    tool_name: 'linear.get_viewer',
    tool_title: 'Get Linear Workspace Viewer Profile',
    provider: 'linear',
    category: 'READ',
    execution_capabilities: ['during_call'],
    when_to_use: "Use this tool when the caller asks about the current user or organization in Linear.",
    requires_confirmation: false,
    allowed_during_call: true,
    timeout_ms: 5000,
    failure_message: "I couldn't retrieve Linear viewer info right now.",
    required_scopes: ['read']
  }
};

export function getToolCallingDefaults(toolName: string): ToolCallingConfig {
  if (TOOL_CALLING_DEFAULTS[toolName]) {
    return TOOL_CALLING_DEFAULTS[toolName];
  }

  const isSlack = toolName.startsWith('slack.');
  const isGoogle = toolName.startsWith('gmail.') || toolName.startsWith('google_');
  const isWrite = toolName.includes('create') || toolName.includes('send') || toolName.includes('update') || toolName.includes('append');
  const isDestructive = toolName.includes('delete') || toolName.includes('cancel') || toolName.includes('remove');
  const cat: ToolCategory = isDestructive ? 'DESTRUCTIVE' : isWrite ? 'WRITE' : 'READ';

  return {
    tool_name: toolName,
    tool_title: toolName,
    provider: isGoogle ? 'gmail' : isSlack ? 'slack' : 'connector',
    category: cat,
    execution_capabilities: cat !== 'READ' ? ['during_call', 'workflow'] : ['during_call'],
    when_to_use: `Use when caller explicitly asks to execute ${toolName}`,
    requires_confirmation: isWrite || isDestructive,
    allowed_during_call: true,
    timeout_ms: isWrite || isDestructive ? 10000 : 8000,
    failure_message: `I couldn't complete the ${toolName} action right now. Please try again.`,
    required_scopes: []
  };
}
