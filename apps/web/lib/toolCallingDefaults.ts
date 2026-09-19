// ============================================================
// VoicePilot Tool Calling Defaults — Ground Truth Registry
// Covers all 18 Google Workspace + 3 Slack tools.
// Both the config drawer and workflow action editor use this.
// ============================================================

export type ToolFieldType =
  | 'text'
  | 'number'
  | 'toggle'
  | 'select'
  | 'multi_select'
  | 'textarea';

export interface ToolFieldOption {
  value: string;
  label: string;
}

export interface ToolSpecificFieldDef {
  key: string;
  label: string;
  type: ToolFieldType;
  default?: any;
  placeholder?: string;
  description?: string;
  options?: ToolFieldOption[];
  /** Only shown in workflow context (not during-call config) */
  workflow_only?: boolean;
  /** Only shown in during-call config context */
  call_only?: boolean;
}

export interface ToolCallingConfig {
  tool_name: string;
  tool_title: string;
  /** 'gmail' = Google Workspace connector slug */
  provider: 'gmail' | 'slack' | string;
  category: 'READ' | 'WRITE' | 'DESTRUCTIVE';
  /** What execution contexts this tool supports */
  execution_capabilities: ('during_call' | 'workflow')[];
  when_to_use: string;
  requires_confirmation: boolean;
  allowed_during_call: boolean;
  timeout_ms: number;
  failure_message: string;
  required_scopes: string[];
  is_destructive?: boolean;
  /** Dynamic, tool-specific form fields rendered below common settings */
  tool_specific_schema: ToolSpecificFieldDef[];
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
    required_scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'gmail.readonly'
    ],
    tool_specific_schema: [
      {
        key: 'max_results',
        label: 'Maximum Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of emails to retrieve (1–20). Keep low for voice responses.'
      },
      {
        key: 'include_spam_trash',
        label: 'Include Spam / Trash',
        type: 'toggle',
        default: false,
        description: 'Search spam and trash folders in addition to inbox.'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'gmail.readonly'
    ],
    tool_specific_schema: [
      {
        key: 'max_body_chars',
        label: 'Max Body Length (chars)',
        type: 'number',
        default: 500,
        placeholder: '500',
        description: 'Limit how many characters of the email body are returned to the voice model. Keep short to avoid verbosity on calls.'
      },
      {
        key: 'include_attachment_metadata',
        label: 'Include Attachment Metadata',
        type: 'toggle',
        default: false,
        description: 'Return file names and sizes of attachments (does not download content).'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/gmail.compose',
      'gmail.compose'
    ],
    tool_specific_schema: [
      {
        key: 'recipient_policy',
        label: 'Recipient Policy',
        type: 'select',
        default: 'any',
        description: 'Control which recipients are allowed.',
        options: [
          { value: 'any', label: 'Any email address' },
          { value: 'contacts_only', label: 'Existing contacts only' },
          { value: 'domain_allowlist', label: 'Allowed domains only' }
        ]
      },
      {
        key: 'allowed_domains',
        label: 'Allowed Domains',
        type: 'text',
        default: '',
        placeholder: 'example.com, acme.org',
        description: 'Comma-separated domains. Only used when Recipient Policy is "Allowed domains only".'
      },
      {
        key: 'allow_cc',
        label: 'Allow CC Field',
        type: 'toggle',
        default: true
      },
      {
        key: 'allow_bcc',
        label: 'Allow BCC Field',
        type: 'toggle',
        default: false
      },
      {
        key: 'max_recipients',
        label: 'Max Recipients',
        type: 'number',
        default: 3,
        placeholder: '3',
        description: 'Maximum number of recipients allowed in a single draft.'
      },
      {
        key: 'to',
        label: 'To (template)',
        type: 'text',
        default: '{{customer.phone}}',
        placeholder: '{{customer.email}}',
        description: 'Default recipient. Supports template variables.',
        workflow_only: true
      },
      {
        key: 'subject',
        label: 'Subject (template)',
        type: 'text',
        default: 'Follow-up from our call',
        placeholder: 'Follow-up regarding our conversation',
        workflow_only: true
      },
      {
        key: 'body',
        label: 'Body (template)',
        type: 'textarea',
        default: 'Hi {{customer.name}},\n\nThank you for speaking with us today.\n\n{{summary}}\n\nBest regards',
        description: 'Email body. Supports template variables like {{summary}}, {{customer.name}}.',
        workflow_only: true
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/gmail.compose',
      'gmail.compose'
    ],
    is_destructive: true,
    tool_specific_schema: [
      {
        key: 'recipient_policy',
        label: 'Recipient Policy',
        type: 'select',
        default: 'contacts_only',
        description: 'Control which recipients are allowed. For send_email, contacts_only is recommended.',
        options: [
          { value: 'any', label: 'Any email address' },
          { value: 'contacts_only', label: 'Existing contacts only (recommended)' },
          { value: 'domain_allowlist', label: 'Allowed domains only' },
          { value: 'explicit_allowlist', label: 'Explicit allowlist only' }
        ]
      },
      {
        key: 'allowed_domains',
        label: 'Allowed Domains',
        type: 'text',
        default: '',
        placeholder: 'example.com, acme.org',
        description: 'Comma-separated domains. Used when Recipient Policy is "Allowed domains".'
      },
      {
        key: 'explicit_allowlist',
        label: 'Explicit Allowlist',
        type: 'textarea',
        default: '',
        placeholder: 'user@example.com\nteam@acme.org',
        description: 'One email per line. Used when policy is "Explicit allowlist".'
      },
      {
        key: 'allow_cc',
        label: 'Allow CC Field',
        type: 'toggle',
        default: false
      },
      {
        key: 'allow_bcc',
        label: 'Allow BCC Field',
        type: 'toggle',
        default: false
      },
      {
        key: 'max_recipients',
        label: 'Max Recipients',
        type: 'number',
        default: 1,
        placeholder: '1',
        description: 'Limit to 1 during calls to prevent bulk sends.'
      },
      {
        key: 'to',
        label: 'To (template)',
        type: 'text',
        default: '',
        placeholder: '{{customer.email}}',
        workflow_only: true
      },
      {
        key: 'subject',
        label: 'Subject (template)',
        type: 'text',
        default: 'Follow-up from our conversation',
        workflow_only: true
      },
      {
        key: 'body',
        label: 'Body (template)',
        type: 'textarea',
        default: 'Hi {{customer.name}},\n\n{{summary}}\n\nBest regards',
        workflow_only: true
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'calendar.events'
    ],
    tool_specific_schema: [
      {
        key: 'default_timezone',
        label: 'Default Timezone',
        type: 'text',
        default: 'Asia/Kolkata',
        placeholder: 'Asia/Kolkata',
        description: 'IANA timezone string used when the caller does not specify a timezone.'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'calendar.events'
    ],
    tool_specific_schema: [
      {
        key: 'max_events',
        label: 'Max Events to Return',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Limit events returned to keep voice responses concise.'
      },
      {
        key: 'default_timezone',
        label: 'Default Timezone',
        type: 'text',
        default: 'Asia/Kolkata',
        placeholder: 'Asia/Kolkata'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'calendar.events'
    ],
    tool_specific_schema: [
      {
        key: 'default_duration_minutes',
        label: 'Default Duration (minutes)',
        type: 'number',
        default: 30,
        placeholder: '30',
        description: 'Default meeting duration when caller does not specify.'
      },
      {
        key: 'default_timezone',
        label: 'Default Timezone',
        type: 'text',
        default: 'Asia/Kolkata',
        placeholder: 'Asia/Kolkata'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'calendar.events'
    ],
    is_destructive: true,
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/contacts',
      'contacts'
    ],
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/contacts',
      'contacts'
    ],
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/contacts',
      'contacts'
    ],
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/contacts',
      'contacts'
    ],
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'drive.file'
    ],
    tool_specific_schema: [
      {
        key: 'max_results',
        label: 'Max Files to Return',
        type: 'number',
        default: 5,
        placeholder: '5'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'drive.file'
    ],
    tool_specific_schema: []
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
    required_scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'spreadsheets'
    ],
    tool_specific_schema: [
      {
        key: 'spreadsheet_id',
        label: 'Default Spreadsheet ID',
        type: 'text',
        default: '',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
        description: 'Google Spreadsheet ID from the URL. Leave empty to let caller provide it.'
      },
      {
        key: 'default_range',
        label: 'Default Range',
        type: 'text',
        default: 'Sheet1!A1:Z100',
        placeholder: 'Sheet1!A1:Z100',
        description: 'Default sheet range to read. Caller can override.'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'spreadsheets'
    ],
    tool_specific_schema: [
      {
        key: 'spreadsheet_id',
        label: 'Target Spreadsheet ID',
        type: 'text',
        default: '',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
        description: 'Google Spreadsheet ID from the URL.'
      },
      {
        key: 'target_range',
        label: 'Target Sheet Range',
        type: 'text',
        default: 'Sheet1!A1',
        placeholder: 'Sheet1!A1'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'spreadsheets'
    ],
    tool_specific_schema: [
      {
        key: 'spreadsheet_id',
        label: 'Target Spreadsheet ID',
        type: 'text',
        default: '',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
      }
    ]
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
    required_scopes: [
      'https://www.googleapis.com/auth/meetings.space.created',
      'meetings.space.created'
    ],
    tool_specific_schema: []
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
    required_scopes: ['channels:read', 'groups:read'],
    tool_specific_schema: [
      {
        key: 'include_private',
        label: 'Include Private Channels',
        type: 'toggle',
        default: false,
        description: 'Include private channels if the bot token has access.'
      },
      {
        key: 'max_results',
        label: 'Max Channels to Return',
        type: 'number',
        default: 20,
        placeholder: '20'
      }
    ]
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
    required_scopes: ['channels:history', 'groups:history'],
    tool_specific_schema: [
      {
        key: 'max_results',
        label: 'Max Results',
        type: 'number',
        default: 5,
        placeholder: '5'
      },
      {
        key: 'lookback_days',
        label: 'Lookback Period (days)',
        type: 'number',
        default: 30,
        placeholder: '30',
        description: 'How many days back to search messages.'
      }
    ]
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
    is_destructive: true,
    tool_specific_schema: [
      {
        key: 'allowed_channels',
        label: 'Allowed Channels',
        type: 'text',
        default: '',
        placeholder: 'sales, support, general',
        description: 'Comma-separated channel names the assistant is allowed to post to. Leave empty to allow any channel.',
        call_only: true
      },
      {
        key: 'default_channel',
        label: 'Default Channel',
        type: 'text',
        default: '',
        placeholder: '#general',
        description: 'Default channel used when the caller does not specify one.'
      },
      {
        key: 'channel',
        label: 'Target Channel (template)',
        type: 'text',
        default: '',
        placeholder: '#sales-leads',
        description: 'Channel to send to. Supports template variables.',
        workflow_only: true
      },
      {
        key: 'text',
        label: 'Message (template)',
        type: 'textarea',
        default: 'New call completed.\n\nCustomer: {{customer.name}} ({{customer.phone}})\nOutcome: {{outcome}}\nSummary: {{summary}}',
        description: 'Message body. Supports template variables.',
        workflow_only: true
      }
    ]
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
    required_scopes: ['crm.objects.contacts.read'],
    tool_specific_schema: [
      {
        key: 'limit',
        label: 'Max Search Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of matching contacts to return.'
      }
    ]
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
    required_scopes: ['crm.objects.contacts.read'],
    tool_specific_schema: []
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
    required_scopes: ['crm.objects.contacts.write'],
    tool_specific_schema: [
      {
        key: 'firstname',
        label: 'First Name (template)',
        type: 'text',
        default: '{{customer.name}}',
        placeholder: '{{customer.name}}',
        workflow_only: true
      },
      {
        key: 'phone',
        label: 'Phone (template)',
        type: 'text',
        default: '{{customer.phone}}',
        placeholder: '{{customer.phone}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['crm.objects.contacts.write'],
    tool_specific_schema: [
      {
        key: 'note',
        label: 'Engagement Note (template)',
        type: 'textarea',
        default: 'VoicePilot Call Summary:\nOutcome: {{outcome}}\n\n{{summary}}',
        description: 'Call summary or note body to attach to the HubSpot contact.',
        workflow_only: true
      }
    ]
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
    required_scopes: [],
    tool_specific_schema: [
      {
        key: 'limit',
        label: 'Max Search Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of Notion pages to return.'
      }
    ]
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
    required_scopes: [],
    tool_specific_schema: []
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
    required_scopes: [],
    tool_specific_schema: [
      {
        key: 'parent_id',
        label: 'Parent Page / Database ID',
        type: 'text',
        default: '',
        placeholder: 'Page or Database UUID',
        description: 'Target parent container in Notion.'
      },
      {
        key: 'title',
        label: 'Page Title (template)',
        type: 'text',
        default: 'Call with {{customer.name}} - {{outcome}}',
        placeholder: 'Meeting Note: {{customer.name}}',
        workflow_only: true
      },
      {
        key: 'content',
        label: 'Page Content (template)',
        type: 'textarea',
        default: 'VoicePilot Call Summary:\n\nCustomer: {{customer.name}} ({{customer.phone}})\nOutcome: {{outcome}}\n\nSummary:\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: [],
    tool_specific_schema: []
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
    required_scopes: [],
    tool_specific_schema: [
      {
        key: 'block_id',
        label: 'Target Page / Block ID',
        type: 'text',
        default: '',
        placeholder: 'Page or Block UUID'
      },
      {
        key: 'text',
        label: 'Content to Append (template)',
        type: 'textarea',
        default: 'Call Note:\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['api'],
    tool_specific_schema: [
      {
        key: 'limit',
        label: 'Max Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of contact records to return.'
      }
    ]
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
    required_scopes: ['api'],
    tool_specific_schema: []
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
    required_scopes: ['api'],
    tool_specific_schema: []
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
    required_scopes: ['api'],
    tool_specific_schema: []
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
    required_scopes: ['api'],
    tool_specific_schema: [
      {
        key: 'limit',
        label: 'Max Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of lead records to return.'
      }
    ]
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
    required_scopes: ['api'],
    tool_specific_schema: []
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
    required_scopes: ['api'],
    tool_specific_schema: []
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
    required_scopes: ['api'],
    tool_specific_schema: [
      {
        key: 'subject',
        label: 'Task Subject (template)',
        type: 'text',
        default: 'VoicePilot Call with {{customer.name}} - {{outcome}}',
        placeholder: 'Call with {{customer.name}}',
        workflow_only: true
      },
      {
        key: 'description',
        label: 'Task Description / Summary (template)',
        type: 'textarea',
        default: 'VoicePilot Call Summary:\nOutcome: {{outcome}}\n\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['api'],
    tool_specific_schema: [
      {
        key: 'title',
        label: 'Note Title (template)',
        type: 'text',
        default: 'Call Note - {{outcome}}',
        workflow_only: true
      },
      {
        key: 'body',
        label: 'Note Body (template)',
        type: 'textarea',
        default: 'VoicePilot Call Summary:\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['read'],
    tool_specific_schema: [
      {
        key: 'limit',
        label: 'Max Results',
        type: 'number',
        default: 5,
        placeholder: '5',
        description: 'Maximum number of Linear issues to return.'
      }
    ]
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
    required_scopes: ['read'],
    tool_specific_schema: []
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
    required_scopes: ['write', 'issues:create'],
    tool_specific_schema: [
      {
        key: 'team_id',
        label: 'Linear Team Key / ID',
        type: 'text',
        default: 'ENG',
        placeholder: 'ENG'
      },
      {
        key: 'title',
        label: 'Issue Title (template)',
        type: 'text',
        default: 'Call with {{customer.name}} - Follow-up Action',
        workflow_only: true
      },
      {
        key: 'description',
        label: 'Issue Description (template)',
        type: 'textarea',
        default: 'VoicePilot Call Summary:\nCustomer: {{customer.name}}\nOutcome: {{outcome}}\n\nNotes:\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['write'],
    tool_specific_schema: []
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
    required_scopes: ['write', 'comments:create'],
    tool_specific_schema: [
      {
        key: 'comment_body',
        label: 'Comment Text (template)',
        type: 'textarea',
        default: 'Call Note:\nOutcome: {{outcome}}\n\n{{summary}}',
        workflow_only: true
      }
    ]
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
    required_scopes: ['read'],
    tool_specific_schema: []
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
    required_scopes: ['read'],
    tool_specific_schema: []
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
    required_scopes: ['read'],
    tool_specific_schema: []
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

  return {
    tool_name: toolName,
    tool_title: toolName,
    provider: isGoogle ? 'gmail' : isSlack ? 'slack' : 'connector',
    category: isDestructive ? 'DESTRUCTIVE' : isWrite ? 'WRITE' : 'READ',
    execution_capabilities: isWrite || isDestructive ? ['during_call', 'workflow'] : ['during_call'],
    when_to_use: `Use when caller explicitly asks to execute ${toolName}`,
    requires_confirmation: isWrite || isDestructive,
    allowed_during_call: true,
    timeout_ms: isWrite || isDestructive ? 10000 : 8000,
    failure_message: `I couldn't complete the ${toolName} action right now. Please try again.`,
    required_scopes: [],
    tool_specific_schema: []
  };
}
