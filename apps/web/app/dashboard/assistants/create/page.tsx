import { CreateAssistantForm } from "./CreateAssistantForm";

export default function CreateAssistantPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Assistant</h2>
        <p className="text-muted-foreground">Configure a new AI voice assistant using all Vomyra API parameters.</p>
      </div>

      <CreateAssistantForm />
    </div>
  );
}
