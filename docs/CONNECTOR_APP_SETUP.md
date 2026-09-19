# VoicePilot Platform Developer App Setup Guide
## Centralized OAuth Application & Credential Configuration

This guide details how the **VoicePilot Platform Owner / Administrator** creates and configures official developer applications across external platforms (Google, Slack, Salesforce, Notion, Linear) to enable one-click customer authorization.

---

## 🔑 Architecture Model

$$\text{VoicePilot Owner Setup} \longrightarrow \text{Server-Side .env Credentials} \longrightarrow \text{Customer Click 'Authorize'} \longrightarrow \text{Provider OAuth Consent} \longrightarrow \text{Encrypted Token Vault}$$

- **VoicePilot Platform Owner**: Creates **one developer application per provider** (Google, Slack, Salesforce, Notion, Linear). Client IDs and Client Secrets are saved in the VoicePilot backend `.env`.
- **VoicePilot Customer**: Does **NOT** create developer accounts or enter API keys. The customer simply clicks `[Authorize]`, logs into their account, grants permission, and VoicePilot securely handles token exchange and AES-256-GCM encryption.

---

## 📋 1. Gmail / Google OAuth Application Setup

### VoicePilot Admin Setup:
1. Log into [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **VoicePilot Production**.
3. Enable the **Gmail API** under **APIs & Services $\rightarrow$ Library**.
4. Go to **APIs & Services $\rightarrow$ OAuth consent screen**:
   - User Type: `External`
   - App Name: `VoicePilot`
   - User support email & developer contact email: `admin@voice.getaipilot.in`
   - Scopes: Add `openid`, `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/userinfo.profile`, `https://www.googleapis.com/auth/gmail.modify`.
5. Go to **APIs & Services $\rightarrow$ Credentials**:
   - Click **Create Credentials** $\rightarrow$ **OAuth client ID**.
   - Application type: `Web application`.
   - Name: `VoicePilot Platform Client`.
   - Authorized redirect URIs: `https://api.getaipilot.in/api/v1/connectors/gmail/callback`
6. Copy the **Client ID** and **Client Secret** and add them to `apps/api/.env`:

```env
GMAIL_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-google-client-secret
GMAIL_REDIRECT_URI=https://api.getaipilot.in/api/v1/connectors/gmail/callback
```

### VoicePilot Customer Connection Flow:
1. Navigate to `/dashboard/connectors`.
2. Click `[Authorize]` next to Gmail.
3. Log into Google Account $\rightarrow$ Click Allow.
4. Google redirects to VoicePilot callback $\rightarrow$ Status changes to **Connected** with customer's email.

---

## 💬 2. Slack OAuth Application Setup

### VoicePilot Admin Setup:
1. Log into [Slack API Console](https://api.slack.com/apps).
2. Click **Create New App** $\rightarrow$ **From scratch**.
   - App Name: `VoicePilot`
   - Development Slack Workspace: Select your organization workspace.
3. Go to **OAuth & Permissions**:
   - Add Redirect URL: `https://api.getaipilot.in/api/v1/connectors/slack/callback`
   - Under **Bot Token Scopes**, add:
     - `channels:read`
     - `chat:write`
     - `search:read`
4. Go to **Basic Information** $\rightarrow$ Copy **Client ID** and **Client Secret**.
5. Add credentials to `apps/api/.env`:

```env
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=https://api.getaipilot.in/api/v1/connectors/slack/callback
```

### VoicePilot Customer Connection Flow:
1. Navigate to `/dashboard/connectors`.
2. Click `[Authorize]` next to Slack.
3. Select Slack Workspace $\rightarrow$ Click Allow.
4. Workspace Bot Token is encrypted and stored in VoicePilot Credential Vault.

---

## ☁️ 3. Salesforce CRM Connected App Setup

### VoicePilot Admin Setup:
1. Log into Salesforce Org as System Administrator.
2. Go to **Setup** $\rightarrow$ Search **App Manager** $\rightarrow$ Click **New Connected App**.
   - Connected App Name: `VoicePilot Connected App`
   - Contact Email: `admin@voice.getaipilot.in`
3. Check **Enable OAuth Settings**:
   - Callback URL: `https://api.getaipilot.in/api/v1/connectors/salesforce/callback`
   - Selected OAuth Scopes:
     - Access and manage your data (api)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
   - Uncheck *Require Secret for Web Server Flow* if necessary, or copy Consumer Key / Consumer Secret.
4. Save and wait 2–10 minutes for Salesforce propagation.
5. Add Consumer Key as `SALESFORCE_CLIENT_ID` and Consumer Secret as `SALESFORCE_CLIENT_SECRET` in `apps/api/.env`:

```env
SALESFORCE_CLIENT_ID=your-salesforce-consumer-key
SALESFORCE_CLIENT_SECRET=your-salesforce-consumer-secret
SALESFORCE_REDIRECT_URI=https://api.getaipilot.in/api/v1/connectors/salesforce/callback
SALESFORCE_AUTH_URL=https://login.salesforce.com
```

---

## 📝 4. Notion Integration App Setup

### VoicePilot Admin Setup:
1. Log into [Notion Integrations](https://www.notion.so/my-integrations).
2. Click **+ New integration**.
   - Type: `Public`
   - Name: `VoicePilot`
   - Company: `VoicePilot`
3. Under **OAuth Domain & URIs**:
   - Redirect URIs: `https://api.getaipilot.in/api/v1/connectors/notion/callback`
4. Copy **Client ID** and **Client Secret**.
5. Add to `apps/api/.env`:

```env
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
NOTION_REDIRECT_URI=https://api.getaipilot.in/api/v1/connectors/notion/callback
```

---

## 📐 5. Linear Issue Tracker OAuth Setup

### VoicePilot Admin Setup:
1. Log into Linear $\rightarrow$ Go to **Settings $\rightarrow$ Account $\rightarrow$ API**.
2. Under **OAuth Applications**, click **New Application**.
   - Application Name: `VoicePilot`
   - Callback URL: `https://api.getaipilot.in/api/v1/connectors/linear/callback`
   - Scopes: `read`, `write`
3. Copy **Client ID** and **Client Secret**.
4. Add to `apps/api/.env`:

```env
LINEAR_CLIENT_ID=your-linear-client-id
LINEAR_CLIENT_SECRET=your-linear-client-secret
LINEAR_REDIRECT_URI=https://api.getaipilot.in/api/v1/connectors/linear/callback
```

---

## ⚡ 6. Zapier Webhooks Setup
- **No Global OAuth App Needed**: Zapier connects via Webhooks.
- **Customer Setup**: Customer pastes their Zapier Catch Hook URL into the tool configuration when creating a workflow rule.

---

## 🤖 7. Custom MCP Server Setup
- **No Global OAuth App Needed**: Custom Model Context Protocol (MCP) servers run on customer infrastructure.
- **Customer Setup**: Customer enters their MCP Server HTTPS URL and optional Bearer Authentication Token. Tokens are encrypted using VoicePilot's `CONNECTOR_ENCRYPTION_KEY`.

---

## 📌 Summary Table of Production Callback URLs

| Provider | Auth Type | Production Callback URL | Developer Console Setting Location |
| :--- | :---: | :--- | :--- |
| **Gmail** | OAuth 2.0 | `https://api.getaipilot.in/api/v1/connectors/gmail/callback` | Google Cloud Console $\rightarrow$ Authorized redirect URIs |
| **Slack** | OAuth 2.0 | `https://api.getaipilot.in/api/v1/connectors/slack/callback` | Slack API Console $\rightarrow$ OAuth & Permissions $\rightarrow$ Redirect URLs |
| **Salesforce** | OAuth 2.0 | `https://api.getaipilot.in/api/v1/connectors/salesforce/callback` | Salesforce Setup $\rightarrow$ App Manager $\rightarrow$ Callback URL |
| **Notion** | OAuth 2.0 | `https://api.getaipilot.in/api/v1/connectors/notion/callback` | Notion Developers $\rightarrow$ Public Integration $\rightarrow$ Redirect URIs |
| **Linear** | OAuth 2.0 | `https://api.getaipilot.in/api/v1/connectors/linear/callback` | Linear Settings $\rightarrow$ API $\rightarrow$ Callback URL |
