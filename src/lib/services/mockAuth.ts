export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  department: string;
  isDemo: boolean;
}

const AUTH_KEY = 'dokumenai_auth_session';
const REMEMBER_KEY = 'dokumenai_remember_email';

export class MockAuthService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static getCurrentUser(): AuthUser | null {
    if (!this.isClient()) return null;
    const data = sessionStorage.getItem(AUTH_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static loginAccount(email: string, name?: string): AuthUser {
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email,
      role: 'enterprise_member',
      roleTitle: 'Enterprise Member',
      department: 'Corporate Accounts',
      isDemo: false,
    };
    if (this.isClient()) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  }

  static registerAccount(name: string, email: string): AuthUser {
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'enterprise_member',
      roleTitle: 'Enterprise Member',
      department: 'Corporate Accounts',
      isDemo: false,
    };
    if (this.isClient()) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  }

  static loginDemo(persona: { name: string; role: string; roleTitle: string; department?: string; email?: string }): AuthUser {
    const user: AuthUser = {
      id: `demo-${persona.role}`,
      name: persona.name,
      email: persona.email || `${persona.role.toLowerCase()}@nusantara-tech.co.id`,
      role: persona.role,
      roleTitle: persona.roleTitle,
      department: persona.department || 'Tax & Financial Operations',
      isDemo: true,
    };
    if (this.isClient()) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  }

  static logout(): void {
    if (this.isClient()) {
      sessionStorage.removeItem(AUTH_KEY);
    }
  }

  static setRememberEmail(email: string): void {
    if (this.isClient()) {
      localStorage.setItem(REMEMBER_KEY, email);
    }
  }

  static getRememberEmail(): string {
    if (!this.isClient()) return '';
    return localStorage.getItem(REMEMBER_KEY) || '';
  }

  static clearRememberEmail(): void {
    if (this.isClient()) {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }
}

