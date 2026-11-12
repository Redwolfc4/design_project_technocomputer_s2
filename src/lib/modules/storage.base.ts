export const STORAGE_KEYS = {
  DOCUMENTS: 'dokumenai:documents:v1',
  BATCHES: 'dokumenai:batches:v1',
  VERIFICATIONS: 'dokumenai:verifications:v1',
  MEMBERS: 'dokumenai:members:v1',
  INTEGRATIONS: 'dokumenai:integrations:v1',
  AUDIT: 'dokumenai:audit:v1',
  SETTINGS: 'dokumenai:settings:v1',
  CURRENT_USER: 'dokumenai:current_user:v1',
} as const;

export function isClientEnvironment(): boolean {
  return typeof window !== 'undefined';
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (!isClientEnvironment()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[Storage] Failed to read key: ${key}`, err);
    return fallback;
  }
}

export function safeLocalStorageSet<T>(key: string, value: T): void {
  if (!isClientEnvironment()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Storage] Failed to write key: ${key}`, err);
  }
}

export function safeLocalStorageRemove(key: string): void {
  if (!isClientEnvironment()) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Storage] Failed to remove key: ${key}`, err);
  }
}

