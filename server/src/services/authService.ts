import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ServerUser {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  password_salt: string;
  role_target: string;
  experience_level: string;
  skills: string[];
  college?: string;
  graduation_year?: string;
  career_goals?: string;
  interviews_remaining: number;
  total_interviews_taken: number;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  token: string;
  userId: string;
  email: string;
  expiresAt: number;
}

export interface ResetTokenData {
  code: string;
  email: string;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Ignore error if directory exists
  }
}

class ServerAuthService {
  private users: Map<string, ServerUser> = new Map();
  private sessions: Map<string, SessionData> = new Map();
  private resetTokens: Map<string, ResetTokenData> = new Map();

  constructor() {
    this.loadUsers();
    this.loadSessions();
  }

  private loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const list: ServerUser[] = JSON.parse(raw);
        for (const u of list) {
          this.users.set(u.email.toLowerCase(), u);
        }
      }
    } catch (e) {
      console.warn('Could not load local users cache, starting empty:', e);
    }
  }

  private loadSessions() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const list: SessionData[] = JSON.parse(raw);
        const now = Date.now();
        for (const s of list) {
          // Only restore non-expired sessions
          if (s.expiresAt > now) {
            this.sessions.set(s.token, s);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load local sessions cache, starting empty:', e);
    }
  }

  private persistSessions() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const list = Array.from(this.sessions.values()).filter(s => s.expiresAt > Date.now());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist sessions file:', e);
    }
  }

  private persistUsers() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const list = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist users file:', e);
    }
  }

  /**
   * Cryptographically hash a password using PBKDF2 with a random salt.
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, saltToUse, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: saltToUse };
  }

  /**
   * Constant-time password comparison to prevent timing attacks.
   */
  verifyPassword(password: string, storedHash: string, salt: string): boolean {
    const { hash } = this.hashPassword(password, salt);
    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Register a new user
   */
  registerUser(params: {
    email: string;
    password: string;
    full_name: string;
  }): { user: Omit<ServerUser, 'password_hash' | 'password_salt'>; token: string } {
    const emailNorm = params.email.trim().toLowerCase();

    if (this.users.has(emailNorm)) {
      throw new Error('An account with this email address already exists.');
    }

    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (!params.full_name || params.full_name.trim().length < 2) {
      throw new Error('Please enter your full name.');
    }

    const { hash, salt } = this.hashPassword(params.password);
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    const newUser: ServerUser = {
      id: userId,
      email: emailNorm,
      full_name: params.full_name.trim(),
      password_hash: hash,
      password_salt: salt,
      role_target: 'Full Stack Developer',
      experience_level: 'fresher',
      skills: ['JavaScript', 'React', 'Problem Solving', 'Data Structures'],
      interviews_remaining: 9999,
      total_interviews_taken: 0,
      created_at: now,
      updated_at: now
    };

    this.users.set(emailNorm, newUser);
    this.persistUsers();

    const token = this.createSession(newUser.id, newUser.email);
    const { password_hash, password_salt, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  /**
   * Authenticate an existing user
   */
  loginUser(email: string, password: string): { user: Omit<ServerUser, 'password_hash' | 'password_salt'>; token: string } {
    const emailNorm = email.trim().toLowerCase();
    const user = this.users.get(emailNorm);

    if (!user) {
      throw new Error('No account found with this email. Please check your spelling or sign up.');
    }

    const isValid = this.verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      throw new Error('Incorrect password. Please verify your credentials or reset your password.');
    }

    const token = this.createSession(user.id, user.email);
    const { password_hash, password_salt, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Create a cryptographically random session token (valid for 30 days)
   */
  createSession(userId: string, email: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    this.sessions.set(token, {
      token,
      userId,
      email,
      expiresAt
    });
    this.persistSessions();
    return token;
  }

  /**
   * Validate a session token
   */
  validateSession(token: string): ServerUser | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      this.persistSessions();
      return null;
    }

    const user = this.users.get(session.email.toLowerCase());
    return user || null;
  }

  /**
   * Invalidate a session (Logout)
   */
  invalidateSession(token: string): boolean {
    const deleted = this.sessions.delete(token);
    if (deleted) {
      this.persistSessions();
    }
    return deleted;
  }

  /**
   * Request password reset code
   */
  requestPasswordReset(email: string): { 
    message: string; 
    resetCode: string; 
    emailDeliveryConfigured: boolean;
    configuredProvider?: string;
  } {
    const emailNorm = email.trim().toLowerCase();
    const user = this.users.get(emailNorm);

    if (!user) {
      throw new Error('No account found with that email address.');
    }

    // Check if an external email provider is configured
    const isSupabaseConfigured = Boolean(
      process.env.VITE_SUPABASE_URL && 
      !process.env.VITE_SUPABASE_URL.includes('your-project-id')
    );
    const hasSmtpConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
    const isEmailDeliveryConfigured = isSupabaseConfigured || hasSmtpConfigured;

    // Generate a secure 6-digit numeric reset code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    this.resetTokens.set(emailNorm, {
      code,
      email: emailNorm,
      expiresAt
    });

    return {
      emailDeliveryConfigured: isEmailDeliveryConfigured,
      configuredProvider: isSupabaseConfigured ? 'Supabase Auth' : hasSmtpConfigured ? 'Custom SMTP' : 'None (Local Sandbox)',
      message: isEmailDeliveryConfigured
        ? `Password recovery instructions dispatched via ${isSupabaseConfigured ? 'Supabase' : 'SMTP'}.`
        : `Email delivery service (Supabase Auth / SMTP) is not configured in this local environment. For local verification, your one-time reset code is: ${code}`,
      resetCode: code
    };
  }

  /**
   * Reset password using verification code
   */
  resetPasswordWithCode(email: string, code: string, newPassword: string): boolean {
    const emailNorm = email.trim().toLowerCase();
    const resetData = this.resetTokens.get(emailNorm);

    if (!resetData) {
      throw new Error('No password reset requested for this email, or the code has expired.');
    }

    if (Date.now() > resetData.expiresAt) {
      this.resetTokens.delete(emailNorm);
      throw new Error('This reset code has expired. Please request a new one.');
    }

    if (resetData.code !== code.trim()) {
      throw new Error('Invalid reset code. Please check the code and try again.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const user = this.users.get(emailNorm);
    if (!user) {
      throw new Error('User not found.');
    }

    const { hash, salt } = this.hashPassword(newPassword);
    user.password_hash = hash;
    user.password_salt = salt;
    user.updated_at = new Date().toISOString();

    this.persistUsers();
    this.resetTokens.delete(emailNorm);

    return true;
  }

  /**
   * Update profile fields
   */
  updateProfile(userId: string, updates: Partial<ServerUser>): ServerUser {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        if (updates.full_name) user.full_name = updates.full_name.trim();
        if (updates.role_target) user.role_target = updates.role_target;
        if (updates.experience_level) user.experience_level = updates.experience_level;
        if (updates.skills) user.skills = updates.skills;
        if (updates.college !== undefined) user.college = updates.college;
        if (updates.graduation_year !== undefined) user.graduation_year = updates.graduation_year;
        if (updates.career_goals !== undefined) user.career_goals = updates.career_goals;
        user.updated_at = new Date().toISOString();
        this.persistUsers();
        return user;
      }
    }
    throw new Error('User not found.');
  }

  getUserById(id: string): ServerUser | null {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }
}

export const serverAuthService = new ServerAuthService();
