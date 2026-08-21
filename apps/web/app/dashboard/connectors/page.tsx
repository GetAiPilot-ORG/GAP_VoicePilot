import React from "react";
import ConnectorsClient from "./ConnectorsClient";

export const metadata = {
  title: "Connectors & Integrations | VoicePilot",
  description: "Manage enterprise tool connectors and AI assistant permissions.",
};

export default function ConnectorsPage() {
  return <ConnectorsClient />;
}
