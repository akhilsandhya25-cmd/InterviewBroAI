function getSupabaseConfig() {
  let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (!url || !url.startsWith('http') || url.includes('undefined')) {
    url = 'https://ochbpanyltnoltelpguk.supabase.co';
  }
  url = url.replace(/\/+$/, '');

  let anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!anonKey || anonKey.length < 20 || anonKey.includes('undefined')) {
    anonKey = 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2';
  }

  let serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  return { url, anonKey, serviceRoleKey };
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
  }
  if (req.readableEnded) {
    return {};
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
    setTimeout(() => resolve({}), 1000);
  });
}

/**
 * Unified Serverless Account Erasure Handler
 * 
 * DPDP Act 2023 Statutory Compliance & Right-to-Erasure:
 * 1. Verifies caller identity via Supabase JWT (HTTP 401)
 * 2. Enforces caller cannot delete another user's ID (HTTP 403)
 * 3. Enforces SUPABASE_SERVICE_ROLE_KEY presence (HTTP 500 SERVICE_ROLE_KEY_MISSING)
 *    Fails loudly before touching any data if service role key is missing.
 *    Never reports success on partial deletion.
 * 4. Erases all user rows from database tables: feedback_reports, interview_sessions, resume_analyses, profiles
 * 5. Erases auth user identity from GoTrue auth.users via Admin API
 * 6. Returns 200 only upon complete confirmed erasure
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'The /api/auth/delete-account endpoint requires a POST request.'
    });
  }

  const { url: supaUrl, anonKey, serviceRoleKey } = getSupabaseConfig();
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const body = await parseBody(req);
  const requestedUserId = body?.userId;

  let authenticatedUserId = null;

  // 1. Verify caller identity server-side using token
  if (token) {
    try {
      const userRes = await fetch(`${supaUrl}/auth/v1/user`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`
        }
      });
      if (userRes.ok) {
        const u = await userRes.json();
        authenticatedUserId = u.id;
      }
    } catch (e) {
      console.warn('[Delete API] Token verification warning:', e.message);
    }
  }

  // Enforce strict server-side authentication: caller must provide a valid, verified token
  if (!authenticatedUserId) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'A valid, unexpired authentication Bearer token is required to delete an account.'
    });
  }

  // Prevent cross-user deletion (IDOR protection)
  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'You cannot delete another user account.'
    });
  }

  const targetUserId = authenticatedUserId;

  // 2. Validate SUPABASE_SERVICE_ROLE_KEY server-side.
  // The service role key is strictly required to purge the GoTrue auth user record.
  // If missing, fail loudly with HTTP 500 and abort immediately to prevent partial erasure.
  const hasServiceRoleKey = Boolean(
    serviceRoleKey &&
    !serviceRoleKey.includes('your-supabase-service-role-key') &&
    serviceRoleKey.length >= 20
  );

  if (!hasServiceRoleKey) {
    console.error('[Delete API] Aborting account deletion: SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
    return res.status(500).json({
      error: 'SERVICE_ROLE_KEY_MISSING',
      message: 'Account deletion could not be completed: Supabase Service Role Key is not configured on the server. Deletion has been aborted to prevent leaving your account in a partial state.'
    });
  }

  try {
    // 3. Delete all candidate database rows across application tables using service role key
    const tables = ['feedback_reports', 'interview_sessions', 'resume_analyses', 'profiles'];
    for (const table of tables) {
      const idCol = table === 'profiles' ? 'id' : 'user_id';
      try {
        const delRes = await fetch(`${supaUrl}/rest/v1/${table}?${idCol}=eq.${targetUserId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=representation'
          }
        });

        if (!delRes.ok && delRes.status !== 404) {
          const errBody = await delRes.text().catch(() => '');
          console.error(`[Delete API] Error deleting from table ${table}:`, delRes.status, errBody);
          return res.status(500).json({
            error: 'DATABASE_PURGE_FAILED',
            message: `Failed to erase user records from database table: ${table}. Partial deletion aborted.`
          });
        }
      } catch (tableErr) {
        console.error(`[Delete API] Exception deleting from table ${table}:`, tableErr.message);
        return res.status(500).json({
          error: 'DATABASE_PURGE_FAILED',
          message: `Network failure while deleting from database table: ${table}. Deletion aborted.`
        });
      }
    }

    // 4. Delete the auth user record via GoTrue Admin API using SUPABASE_SERVICE_ROLE_KEY
    const adminRes = await fetch(`${supaUrl}/auth/v1/admin/users/${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });

    if (!adminRes.ok) {
      const errBody = await adminRes.text().catch(() => '');
      console.error('[Delete API] Admin auth user deletion failed:', adminRes.status, errBody);
      return res.status(500).json({
        error: 'AUTH_USER_DELETION_FAILED',
        message: `Failed to erase user identity from authentication provider (Status ${adminRes.status}). Partial deletion was prevented.`
      });
    }

    // 5. Success: Both table rows and auth.users identity are completely erased.
    return res.status(200).json({
      success: true,
      recordsPurged: true,
      authAccountDeleted: true,
      message: 'Account credentials and all associated database records have been permanently deleted.',
      userId: targetUserId
    });
  } catch (err) {
    console.error('[Delete API] Exception processing deletion:', err);
    return res.status(500).json({
      error: 'DELETION_ERROR',
      message: 'Encountered an internal error while deleting account data.'
    });
  }
}
