import React from "react";
import IntegrationManagementClient from "./IntegrationManagementClient";

export const metadata = {
  title: "Integration Availability Management | VoicePilot Admin",
  description: "Centralized Integration Availability and Status Control Center",
};

export default function AdminIntegrationsPage() {
  return <IntegrationManagementClient />;
}
