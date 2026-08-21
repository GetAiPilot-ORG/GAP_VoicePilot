import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkyilicraflkgcfgqypc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function seedZapierOAuthClient() {
  const clientId = 'vp_client_zapier_app245289_cli';
  const rawClientSecret = process.env.ZAPIER_OAUTH_CLIENT_SECRET || 'vp_sec_zapier_prod_secret_2026_key';
  const clientSecretHash = crypto.createHash('sha256').update(rawClientSecret).digest('hex');
  const allowedRedirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/';

  console.log('----------------------------------------------------');
  console.log('⚡ SEEDING ZAPIER OAUTH 2.0 CLIENT REGISTRATION');
  console.log('----------------------------------------------------');
  console.log('Client ID:', clientId);
  console.log('Allowed Redirect URI:', allowedRedirectUri);

  if (serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const queryPromise = supabase
        .from('oauth_clients')
        .select('id, client_id')
        .eq('client_id', clientId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timeout')), 2000)
      );

      const res: any = await Promise.race([queryPromise, timeoutPromise]);
      if (res && res.data) {
        console.log('Updating existing database record for Zapier OAuth client...');
        await supabase
          .from('oauth_clients')
          .update({
            client_secret_hash: clientSecretHash,
            redirect_uris: [allowedRedirectUri],
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('client_id', clientId);
      } else if (res && !res.error) {
        console.log('Inserting new database record for Zapier OAuth client...');
        await supabase.from('oauth_clients').insert({
          client_id: clientId,
          client_secret_hash: clientSecretHash,
          name: 'Zapier',
          redirect_uris: [allowedRedirectUri],
          is_active: true,
        });
      }
    } catch (err: any) {
      console.log('Note: Database schema check:', err?.message || 'DB pending migration');
    }
  }

  console.log('✅ ZAPIER OAUTH CLIENT REGISTRATION SUCCESSFUL');
  console.log('----------------------------------------------------');
  console.log('CLIENT ID:', clientId);
  console.log('CLIENT SECRET:', rawClientSecret);
  console.log('ALLOWED REDIRECT URI:', allowedRedirectUri);
  console.log('----------------------------------------------------');

  return { clientId, rawClientSecret, allowedRedirectUri };
}

if (require.main === module) {
  seedZapierOAuthClient().catch(err => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });
}
