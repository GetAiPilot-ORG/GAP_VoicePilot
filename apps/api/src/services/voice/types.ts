export interface CreateAssistantInput {
  name: string;
  [key: string]: any;
}

export interface InitiateCallInput {
  customer_number: string | number;
  customer_name: string;
  assistant_id?: string;
  assigned_number?: string | number;
  customer_country_code?: string;
  additional_data?: Record<string, any>;
  idempotency_key?: string;
}

export interface ProviderCall {
  id: string;
  status: string;
  assistant_number?: string;
  customer_number?: string;
  provider?: string;
  additional_data?: any;
  [key: string]: any;
}

export interface VoiceProvider {
  createAssistant(input: CreateAssistantInput): Promise<any>;
  initiateCall(input: InitiateCallInput): Promise<ProviderCall>;
  getCall(id: string): Promise<ProviderCall>;
}
