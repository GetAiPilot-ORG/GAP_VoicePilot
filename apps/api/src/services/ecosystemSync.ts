import { SupabaseClient } from '@supabase/supabase-js';

interface VoiceContactInput {
  workspaceId: string;
  userId: string;
  name: string;
  phone: string;
  metadata?: Record<string, unknown>;
}

interface VoiceContactRow {
  id: string;
  workspace_id: string;
  name: string | null;
  phone: string;
  metadata?: Record<string, unknown> | null;
}

const getHubUserId = async (
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> => {
  const fallback =
    process.env.HUB_OWNER_USER_ID || process.env.ECOSYSTEM_HUB_USER_ID || null;

  const { data, error } = await supabase
    .from('profiles')
    .select('hub_user_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[Ecosystem] Voice hub user lookup failed:', error.message);
  }

  return data?.hub_user_id || fallback;
};

const syncVoiceContactToHub = async (
  supabase: SupabaseClient,
  contact: VoiceContactRow,
  userId: string
) => {
  const hubFnUrl = process.env.HUB_ECOSYSTEM_SYNC_FUNCTION_URL;
  const syncSecret = process.env.ECOSYSTEM_SYNC_SECRET;

  if (!hubFnUrl || !syncSecret) return;

  const hubUserId = await getHubUserId(supabase, userId);
  if (!hubUserId) {
    await supabase
      .from('contacts')
      .update({
        ecosystem_sync_status: 'skipped',
        ecosystem_sync_source: 'missing_hub_user_id',
        ecosystem_synced_at: new Date().toISOString(),
      })
      .eq('id', contact.id);
    return;
  }

  const response = await fetch(hubFnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ecosystem-sync-secret': syncSecret,
    },
    body: JSON.stringify({
      action: 'upsert_contact',
      user_id: hubUserId,
      source_platform: 'voice',
      external_contact_id: contact.id,
      contact: {
        full_name: contact.name || 'Voice Contact',
        phone: contact.phone,
        metadata: {
          ...(contact.metadata || {}),
          voice_workspace_id: contact.workspace_id,
        },
        tags: ['voice-campaign'],
      },
      target_platforms: ['crm', 'whatsapp', 'social'],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    await supabase
      .from('contacts')
      .update({
        ecosystem_sync_status: 'failed',
        ecosystem_sync_source: 'hub_error',
        ecosystem_synced_at: new Date().toISOString(),
      })
      .eq('id', contact.id);
    throw new Error(payload?.error || `Hub sync returned ${response.status}`);
  }

  await supabase
    .from('contacts')
    .update({
      canonical_contact_id: payload?.contact?.id || null,
      ecosystem_sync_status: 'synced',
      ecosystem_sync_source: 'hub',
      ecosystem_synced_at: new Date().toISOString(),
    })
    .eq('id', contact.id);
};

export const upsertVoiceContactForEcosystem = async (
  supabase: SupabaseClient,
  input: VoiceContactInput
): Promise<VoiceContactRow | null> => {
  const { data: existing } = await supabase
    .from('contacts')
    .select('id, workspace_id, name, phone, metadata')
    .eq('workspace_id', input.workspaceId)
    .eq('phone', input.phone)
    .limit(1)
    .maybeSingle();

  const metadata = {
    ...(existing?.metadata || {}),
    ...(input.metadata || {}),
    ecosystem_last_seen_at: new Date().toISOString(),
  };

  const { data, error } = existing?.id
    ? await supabase
        .from('contacts')
        .update({
          name: input.name,
          metadata,
          ecosystem_sync_status: 'local',
        })
        .eq('id', existing.id)
        .select('id, workspace_id, name, phone, metadata')
        .single()
    : await supabase
        .from('contacts')
        .insert({
          workspace_id: input.workspaceId,
          name: input.name,
          phone: input.phone,
          metadata,
          ecosystem_sync_status: 'local',
        })
        .select('id, workspace_id, name, phone, metadata')
        .single();

  if (error || !data) {
    console.warn('[Ecosystem] Voice local contact upsert failed:', error?.message);
    return null;
  }

  syncVoiceContactToHub(supabase, data as VoiceContactRow, input.userId).catch(
    (error) => {
      console.warn('[Ecosystem] Voice contact sync failed:', error.message);
    }
  );

  return data as VoiceContactRow;
};
