/**
 * Admin Authentication Service
 *
 * Manages SameerDev Admin Panel session state cleanly in one place.
 */

const AUTH_STORAGE_KEY = 'sameerdev_admin_auth';

export interface AdminSession {
  username: string;
  loggedInAt: string;
}

const VALID_CREDENTIALS = [
  { username: 'Sameer', password: 'Sameer@78' },
];

export const authService = {
  /**
   * Checks whether an admin portal session exists and is active.
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed.username === 'string');
    } catch {
      return false;
    }
  },

  /**
   * Retrieves the current admin session information.
   */
  getSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AdminSession;
    } catch {
      return null;
    }
  },

  /**
   * Authenticates the admin user with provided username and password.
   */
  login(usernameInput: string, passwordInput: string): { success: boolean; error?: string } {
    const username = usernameInput.trim();
    const password = passwordInput;

    if (!username || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    const matched = VALID_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );

    if (!matched) {
      return { success: false, error: 'Invalid username or password. Please verify your credentials.' };
    }

    const session: AdminSession = {
      username: matched.username,
      loggedInAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    } catch (e) {
      console.warn('Unable to persist admin session:', e);
      return { success: false, error: 'Storage error. Please enable cookies/localStorage.' };
    }
  },

  /**
   * Terminates the current admin session and clears stored state.
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear admin session:', e);
    }
  },
};
