export interface CreateAssistantInput {
  name: string;
  [key: string]: any;
}

export interface InitiateCallInput {
  idempotency_key: string;
  assistant: string;
  to: string;
  from: string;
}

export interface ProviderCall {
  id: string;
  status: string;
}

export interface VoiceProvider {
  createAssistant(input: CreateAssistantInput): Promise<any>;
  initiateCall(input: InitiateCallInput): Promise<ProviderCall>;
  getCall(id: string): Promise<ProviderCall>;
}
