# 🎯 Simple Summary: What We Get vs What We Don't Get from API

---

## 🟢 1. What We ARE Getting from API (Fully Working)

1. **AI Brain (LLM Providers):**  
   * **OpenAI**
   * **Groq**
   * **xAI**
   * **Mistral**
   * **Anthropic**

2. **Voice Providers (TTS) Available in API:**  
   * **Azure Neural** (Hindi & English voices: *Aarti*, *Arjun*, *Neerja*, *Jenny*, etc.)
   * **Cartesia** (Ultra-low latency voices)
   * **OpenAI Voice**
   * **xAI Voice**
   * **Mistral Voice**

3. **Speech Transcribers (STT) Available in API:**  
   * **Deepgram Nova-2** (with custom silence / utterance end delay)
   * **Gladia**
   * **Smallest AI**

4. **Bot Prompts & Training:**  
   * System persona instructions, rules, FAQs, and welcome greeting message.

5. **Dynamic Welcome Greetings:**  
   * Calling customers by their real names dynamically (e.g. *"Hello {{name}}"*).

6. **Post-Call WhatsApp Summaries:**  
   * Automatically creates call summaries and sends them to your WhatsApp number.

7. **WhatsApp Voice Calling:**  
   * Fetching WhatsApp phone numbers and dialing calls directly over WhatsApp.

---

## 🔴 2. What We Are NOT Getting from API (Missing / Platform Only)

1. **Specific Voice & Telephony Providers NOT in API:**  
   * ❌ **Sarvam AI** (Not available via API)
   * ❌ **Murf AI** (Not available via API)
   * ❌ **Ganani** (Not available via API)
   * ❌ **Agora** (Not available via API)
   * ❌ **Artesia** (Not available via API)

2. **Direct PDF / Document File Upload API:**  
   * ❌ There is **no API endpoint** to upload raw PDF files or crawl URLs directly. In their system, you must upload files manually inside their portal to create a **Knowledge Base Tool**, which is then attached to the assistant.

3. **WhatsApp Meta Developer Settings Form:**  
   * ❌ Entering **Meta App ID**, **System User Access Token**, and **Phone Number ID** is a platform settings form, not a public REST API.

4. **WhatsApp Message Templates Registration:**  
   * ❌ Registering new message templates for Meta verification and approval is done inside the portal / Meta Business Manager.

---

## 💡 Quick Summary Checklist

| Category | Available via API ✅ | NOT Available via API ❌ |
| :--- | :--- | :--- |
| **Voice Providers (TTS)** | Azure Neural, Cartesia, OpenAI, xAI, Mistral | **Sarvam, Murf, Ganani, Agora, Artesia** |
| **Speech Transcribers (STT)** | Deepgram Nova-2, Gladia, Smallest AI | — |
| **AI LLM Brains** | OpenAI, Groq, xAI, Mistral, Anthropic | — |
| **Prompts & Dynamic Name** | System prompt, greetings, `{{name}}` tag | — |
| **Knowledge Base** | Connecting existing tool IDs | Direct raw PDF upload endpoint |
| **WhatsApp Features** | WhatsApp calling, post-call summary prompt | Meta App ID/Token form, Template creator |
