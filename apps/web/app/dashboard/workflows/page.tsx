import React from "react";
import WorkflowsClient from "./WorkflowsClient";

export const metadata = {
  title: "Automated Workflows | VoicePilot",
  description: "Configure event-driven workflow rules for AI call events.",
};

export default function WorkflowsPage() {
  return <WorkflowsClient />;
}
