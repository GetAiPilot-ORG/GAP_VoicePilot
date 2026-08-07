# Vomyra Assistant Pages Integration Plan

This plan outlines the changes needed to fully support all 43 Vomyra API fields when creating and editing assistants, building a fully functional Create Assistant page, and implementing the multi-tab Assistant Edit/Detail page.

## Proposed Changes

We will implement changes across three main areas:
1. **Express Backend API** (`apps/api`): Add GET, PUT, and Tool Assignment routes, and update the Vomyra provider client.
2. **Frontend Actions** (`apps/web/app/actions`): Add Server Actions for updating assistants, fetching workspace tools, and toggling tool assignments.
3. **Frontend Views** (`apps/web/app/dashboard/assistants`):
   - Redesign `CreateAssistantForm.tsx` to handle all 43 fields structured properly.
   - Create a new dynamic route `[id]/page.tsx` and an `EditAssistantForm.tsx` component with tabs matching the user's design:
     - **Model Tab**: AI Provider, Model, Max Tokens, Temperature, Dynamic Welcome Message toggle + input, and System Prompt.
     - **Speech Input Tab**: STT Provider, Language Mode (Single/Bilingual), and Transcription Language.
     - **Voice Tab**: Voice Provider, Voice Name, Language, Voice Speed (multiplier), and a Featured Voices listing.
     - **Tools Tab**: A checklist/toggle interface to assign/unassign workspace tools to the assistant.
     - **Advance Settings Tab**: Call Behavior parameters (Max Duration, Silence Timeout, Inactivity Message, Timeout End Message, Filler Words toggle, Filler Words list, and Maintain Context).

---

### Backend API (`apps/api`)

#### [MODIFY] [client.ts](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/api/src/services/voice/providers/vomyra/client.ts)
Add `getAssistant` and `updateAssistant` methods to the `VomyraClient` class to interface with Vomyra's GET and PUT endpoints:
- `getAssistant(id: string): Promise<any>`
- `updateAssistant(id: string, input: any): Promise<any>`
- `assignTool(id: string, toolId: string): Promise<any>`
- `unassignTool(id: string, toolId: string): Promise<any>`

#### [MODIFY] [assistants.ts](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/api/src/routes/assistants.ts)
- Update the `POST /` route to extract and forward the complete nested payload (with `voice`, `deepgram`, `cartesia`, `gladia`, `smallest_ai` objects) received from the client.
- Add `GET /:id` to fetch assistant metadata from Supabase, then fetch current settings from Vomyra (falling back to the database snapshot if Vomyra is down).
- Add `PUT /:id` to update assistant config on Vomyra and update the `config_snapshot` and `name` in Supabase.
- Add `POST /:id/tools` to assign a tool (calls Vomyra assign tool, and adds a record in `assistant_tools` table).
- Add `DELETE /:id/tools/:toolId` to unassign a tool (calls Vomyra unassign tool, and removes the record from `assistant_tools` table).

---

### Frontend Server Actions (`apps/web`)

#### [MODIFY] [assistants.ts](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/web/app/actions/assistants.ts)
- Update `createAssistantAction` to read the complete nested configuration payload and send it to the backend.
- Add `updateAssistantAction(id: string, payload: any)` to forward assistant updates.
- Add `toggleAssistantToolAction(assistantId: string, toolId: string, assign: boolean)` to call the backend tool assignment routes.

---

### Frontend Components (`apps/web`)

#### [MODIFY] [catalog.ts](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/web/lib/catalog.ts)
Extend static voice data and list mappings to include all options from the Vomyra catalog for models, voices, STT, and featured lists.

#### [MODIFY] [CreateAssistantForm.tsx](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/web/app/dashboard/assistants/create/CreateAssistantForm.tsx)
- Redesign the layout to make the configuration categories collapsible or clearly divided.
- Ensure all 43 fields are bound to inputs with appropriate defaults (e.g. `maximum_duration = 600`, `silence_timeout = 12`, ElevenLabs properties, STT options).

#### [NEW] [[id] Folder](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/web/app/dashboard/assistants/[id]/page.tsx)
- Create a Next.js App Router dynamic route for the assistant details.
- Fetch the assistant details and active tools list on the server.
- Render `EditAssistantForm.tsx` inside.

#### [NEW] [EditAssistantForm.tsx](file:///c:/Users/pc/Documents/GitHub/GAP/New_VoicePilot/apps/web/app/dashboard/assistants/[id]/EditAssistantForm.tsx)
- Implement a tabs-based interface matching the user's design:
  - **Tabs list**: Model, Speech Input, Voice, Tools, Advance Settings.
  - Bind all fields to inputs inside the corresponding tabs.
  - Implement dynamic lists (e.g. showing ElevenLabs-specific settings only when ElevenLabs is selected).
  - **Tools Tab**: Render a list of workspace tools. Bind their toggles to call the Server Action `toggleAssistantToolAction` instantly.
  - Add an "Update" button in the tab sections that invokes `updateAssistantAction` with the current values.

---

## Verification Plan

### Automated Tests
- Validate that the Express server compiles and routes matches.
- Run typechecking in Next.js frontend using `npm run build` or `npx tsc --noEmit`.

### Manual Verification
- Deploy/start local services.
- Create an assistant with custom STT and TTS properties (e.g., Deepgram & ElevenLabs settings). Verify that the Express server forwards it correctly to Vomyra.
- Navigate to the assistant edit page, change the temperature and max tokens, select new voice rate, and verify that the "Update" action saves the config to Supabase and updates Vomyra.
- Toggle tool assignments in the tools tab and verify that the database table `assistant_tools` is updated.
