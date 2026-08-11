export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Plant Manager' | 'Accounts Head';
  avatarInitials: string;
  lastLogin: string;
}

const AUTH_STORAGE_KEY = 'textile_erp_auth_user';
const AUTH_TOKEN_KEY = 'textile_erp_auth_token';

// Default Demo Credentials
export const DEMO_CREDENTIALS = [
  {
    username: 'admin@textileerp.com',
    password: 'admin123',
    name: 'Rajesh Sharma',
    role: 'Super Admin' as const,
    avatarInitials: 'RS'
  },
  {
    username: 'manager@textileerp.com',
    password: 'manager123',
    name: 'Kishan Patel',
    role: 'Plant Manager' as const,
    avatarInitials: 'KP'
  }
];

export const authService = {
  getCurrentUser: (): AuthUser | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const user = authService.getCurrentUser();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!(user && token);
  },

  login: (usernameInput: string, passwordInput: string): { success: boolean; user?: AuthUser; error?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Please enter both username/email and password.' };
    }

    // Check against demo credentials or standard rules
    const matched = DEMO_CREDENTIALS.find(
      c => (c.username.toLowerCase() === cleanUser || c.username.split('@')[0].toLowerCase() === cleanUser)
    );

    if (matched) {
      if (matched.password !== cleanPass) {
        return { success: false, error: 'Invalid username or password.' };
      }

      const user: AuthUser = {
        id: 'usr_' + Date.now(),
        username: matched.username,
        email: matched.username,
        name: matched.name,
        role: matched.role,
        avatarInitials: matched.avatarInitials,
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));

      return { success: true, user };
    }

    // Fallback for custom credentials if pass >= 6 chars
    if (cleanPass.length >= 6) {
      const displayName = cleanUser.includes('@') 
        ? cleanUser.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : cleanUser.replace(/\b\w/g, l => l.toUpperCase());

      const user: AuthUser = {
        id: 'usr_' + Date.now(),
        username: cleanUser,
        email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@textileerp.com`,
        name: displayName || 'Admin User',
        role: 'Super Admin',
        avatarInitials: (displayName.substring(0, 2) || 'AD').toUpperCase(),
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));

      return { success: true, user };
    }

    return { 
      success: false, 
      error: 'Invalid username or password. Password must be at least 6 characters.' 
    };
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};
