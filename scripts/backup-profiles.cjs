/**
 * InterviewBro AI - Candidate Profiles Backup & Export Utility
 * 
 * Safely exports existing public.profiles records and local storage backups
 * to a timestamped JSON file before executing database schema migrations.
 */

const fs = require('fs');
const path = require('path');

async function backupProfiles() {
  console.log('====================================================');
  console.log('STARTING CANDIDATE PROFILES EXPORT & BACKUP');
  console.log('====================================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `profiles-backup-${timestamp}.json`);

  const supaUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ochbpanyltnoltelpguk.supabase.co').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2').trim();

  const keyToUse = serviceKey && serviceKey.length > 20 ? serviceKey : anonKey;

  let remoteProfiles = [];
  try {
    const res = await fetch(`${supaUrl}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`
      }
    });

    if (res.ok) {
      remoteProfiles = await res.json();
      console.log(`[Backup] Successfully retrieved ${remoteProfiles.length} remote profile records from Supabase.`);
    } else {
      console.warn(`[Backup] Supabase query returned HTTP ${res.status}. Proceeding with local data check.`);
    }
  } catch (err) {
    console.warn('[Backup] Network query notice:', err.message);
  }

  // Also backup local mock/test user files if present
  let localUsers = [];
  const localUsersPath = path.resolve(__dirname, '../.data/users.json');
  if (fs.existsSync(localUsersPath)) {
    try {
      localUsers = JSON.parse(fs.readFileSync(localUsersPath, 'utf8'));
      console.log(`[Backup] Found ${localUsers.length} local user records.`);
    } catch (e) {
      // ignore
    }
  }

  const backupPayload = {
    exportedAt: new Date().toISOString(),
    recordCount: remoteProfiles.length,
    remoteProfiles,
    localUsers,
    schemaVersion: 'legacy_v1_profiles'
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf8');
  console.log(`✅ [Backup Complete] Saved backup to: ${backupFilePath}`);
  console.log('====================================================\n');
  return backupFilePath;
}

if (require.main === module) {
  backupProfiles()
    .then((filePath) => {
      console.log(`Backup completed successfully at: ${filePath}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Backup failed:', err);
      process.exit(1);
    });
}

module.exports = { backupProfiles };
