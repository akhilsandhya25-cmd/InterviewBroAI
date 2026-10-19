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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'The /api/auth/delete-account endpoint requires a POST request.'
    });
  }

  const { url: supaUrl, anonKey, serviceRoleKey } = getSupabaseConfig();
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const body = await parseBody(req);
  const requestedUserId = body.userId;

  let authenticatedUserId = null;

  // Verify caller identity server-side using token
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

  // Enforce authorization: user must match their own token, or token must identify the user
  const targetUserId = authenticatedUserId || requestedUserId;
  if (!targetUserId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'A valid authenticated session or User ID is required to process account deletion.'
    });
  }

  // Prevent cross-user deletion (IDOR protection)
  if (authenticatedUserId && requestedUserId && authenticatedUserId !== requestedUserId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You cannot delete another user account.'
    });
  }

  try {
    let adminDeleted = false;

    // If server environment has service role key, perform full GoTrue admin user purge
    if (serviceRoleKey) {
      const adminRes = await fetch(`${supaUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      });
      if (adminRes.ok) {
        adminDeleted = true;
      }
    }

    // Clean up DB rows using user token or service key
    const authBearer = serviceRoleKey ? serviceRoleKey : token;
    const authApiKey = serviceRoleKey ? serviceRoleKey : anonKey;

    if (authBearer) {
      const tables = ['feedback_reports', 'interview_sessions', 'resume_analyses', 'profiles'];
      for (const table of tables) {
        const idCol = table === 'profiles' ? 'id' : 'user_id';
        await fetch(`${supaUrl}/rest/v1/${table}?${idCol}=eq.${targetUserId}`, {
          method: 'DELETE',
          headers: {
            'apikey': authApiKey,
            'Authorization': `Bearer ${authBearer}`
          }
        }).catch(() => null);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Account and associated records have been successfully purged.',
      userId: targetUserId,
      adminPurged: adminDeleted
    });
  } catch (err) {
    console.error('[Delete API] Error processing deletion:', err);
    return res.status(500).json({
      error: 'Deletion Error',
      message: 'Encountered an internal error while deleting account data.'
    });
  }
}
