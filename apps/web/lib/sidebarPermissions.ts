export type SidebarPermissionRole = "user" | "admin";
export type SidebarPermissionsConfig = Record<string, SidebarPermissionRole>;

export interface SidebarModuleDefinition {
  href: string;
  name: string;
  description: string;
  iconName: string;
  category: "navigation" | "system";
  defaultPermission?: SidebarPermissionRole;
  badge?: string;
  badgeVariant?: "live" | "new" | "default";
}

/**
 * MASTER SINGLE SOURCE OF TRUTH FOR ALL SIDEBAR MODULES
 * Whenever any new feature or tab is added to the application sidebar,
 * add it here and it will automatically appear in:
 * 1. Admin Sidebar Permissions Access Control Matrix
 * 2. Navigation Sidebar
 * 3. Default Permissions fallback
 * 4. Route Access Guards
 */
export const ALL_SIDEBAR_MODULES: SidebarModuleDefinition[] = [
  {
    href: "/dashboard",
    name: "Overview",
    description: "Main overview page with aggregate metrics, real-time activity, and quick actions.",
    iconName: "LayoutDashboard",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/assistants",
    name: "Assistants",
    description: "Manage neural voice agents, prompts, voices, tools, and dynamic product catalogs.",
    iconName: "Bot",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/connectors",
    name: "Connectors & Tools",
    description: "Third-party integrations, API webhooks, database actions, and tool execution mappings.",
    iconName: "Share2",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/workflows",
    name: "Workflows & Automation",
    description: "Automated trigger pipelines for call outcomes, CRM syncing, and scheduled events.",
    iconName: "GitBranch",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/contacts",
    name: "Contacts & Sync",
    description: "Customer contact uploads, custom lists, audience segments, and database synchronization.",
    iconName: "Users",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/campaigns",
    name: "Campaigns",
    description: "High-volume automated outbound dialing operations, scheduled runs, and call queues.",
    iconName: "Megaphone",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/whatsapp",
    name: "WhatsApp",
    description: "WhatsApp Cloud API integration, automated templates, broadcast lists, and chat automation.",
    iconName: "MessageSquare",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/phone-numbers",
    name: "Phone Numbers",
    description: "Rent virtual phone lines, configure SIP trunks, and bind numbers to voice assistants.",
    iconName: "PhoneCall",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/calls",
    name: "Call Logs & Audio",
    description: "Review call recordings, audio player, cost metrics, and AI conversation transcripts.",
    iconName: "Headphones",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/analytics",
    name: "Analytics",
    description: "Detailed performance telemetry, latency breakdowns, pickup rates, and cost analysis.",
    iconName: "TrendingUp",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/billing",
    name: "Plans & Billing",
    description: "Subscription tiers, wallet recharges, Razorpay payments, and invoice receipts.",
    iconName: "CreditCard",
    category: "navigation",
    defaultPermission: "user",
  },
  {
    href: "/dashboard/settings",
    name: "API & Webhooks",
    description: "System API credentials, webhook endpoints, workspace security, and environment configs.",
    iconName: "Webhook",
    category: "system",
    defaultPermission: "user",
    badge: "LIVE",
    badgeVariant: "live",
  },
];

/**
 * Automatically computes default permissions from the master module registry
 */
export const DEFAULT_SIDEBAR_PERMISSIONS: SidebarPermissionsConfig = ALL_SIDEBAR_MODULES.reduce(
  (acc, mod) => {
    acc[mod.href] = mod.defaultPermission || "user";
    return acc;
  },
  {} as SidebarPermissionsConfig
);
