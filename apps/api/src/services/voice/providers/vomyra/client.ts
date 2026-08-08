import { VoiceProvider, CreateAssistantInput, InitiateCallInput, ProviderCall } from '../../types';

export class VomyraClient implements VoiceProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VOMYRA_API_KEY || '0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx';
    this.baseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const jsonErr = JSON.parse(errorText);
        parsedError = jsonErr.error?.message || jsonErr.message || errorText;
      } catch (e) {}
      throw new Error(`Vomyra API Error (${response.status}): ${parsedError}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create Assistant on Vomyra API
   */
  async createAssistant(input: CreateAssistantInput): Promise<any> {
    const sanitizedInput = { ...input };

    if (sanitizedInput.voice) {
      const voiceObj = { ...sanitizedInput.voice };
      if (!voiceObj.tts_model || voiceObj.tts_model === null) {
        delete voiceObj.tts_model;
      }
      sanitizedInput.voice = voiceObj;
    }

    console.log("Sending sanitized assistant payload to Vomyra API:", JSON.stringify(sanitizedInput));

    return await this.request<any>('/v1/assistants', {
      method: 'POST',
      body: JSON.stringify(sanitizedInput),
    });
  }

  async getAssistant(id: string): Promise<any> {
    return await this.request<any>(`/v1/assistants/${id}`, {
      method: 'GET',
    });
  }

  async updateAssistant(id: string, input: any): Promise<any> {
    const sanitizedInput = { ...input };
    if (sanitizedInput.voice && (sanitizedInput.voice.tts_model === null || !sanitizedInput.voice.tts_model)) {
      delete sanitizedInput.voice.tts_model;
    }
    return await this.request<any>(`/v1/assistants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedInput),
    });
  }

  /**
   * Archive / Mark Deleted on Vomyra API
   * (Vomyra API disables HTTP DELETE to prevent accidental data loss, so we rename to [DELETED])
   */
  async deleteAssistant(id: string): Promise<any> {
    try {
      return await this.request<any>(`/v1/assistants/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: `[DELETED_${Date.now().toString().slice(-4)}]` })
      });
    } catch (err: any) {
      console.warn(`Vomyra API archive assistant ${id} error:`, err.message);
      return { success: true };
    }
  }

  async assignTool(assistantId: string, toolId: string): Promise<any> {
    return await this.request<any>(`/v1/assistants/${assistantId}/tools`, {
      method: 'POST',
      body: JSON.stringify({ tool_id: toolId }),
    });
  }

  async unassignTool(assistantId: string, toolId: string): Promise<any> {
    return await this.request<any>(`/v1/assistants/${assistantId}/tools/${toolId}`, {
      method: 'DELETE',
    });
  }

  async initiateCall(input: InitiateCallInput): Promise<ProviderCall> {
    return this.request<ProviderCall>('/v1/calls', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getCall(id: string): Promise<ProviderCall> {
    return this.request<ProviderCall>(`/v1/calls/${id}`, {
      method: 'GET',
    });
  }

  async assignPhoneNumber(numberId: string, assistantId: string): Promise<any> {
    return await this.request<any>('/v1/phone-numbers/assign', {
      method: 'PUT',
      body: JSON.stringify({ number_id: numberId, assistant_id: assistantId }),
    });
  }

  async unassignPhoneNumber(numberId: string): Promise<any> {
    return await this.request<any>(`/v1/phone-numbers/unassign/${numberId}`, {
      method: 'DELETE',
    });
  }
}
