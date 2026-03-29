import Constants from 'expo-constants';

/**
 * API base URL resolution order:
 * 1. EXPO_PUBLIC_API_URL — .env / shell (use your PC LAN IP from a physical phone, or http://10.0.2.2:8000 for Android emulator)
 * 2. Web on localhost — Django on this machine (ignores a stale remote URL in app.json)
 * 3. expo.extra.apiUrl from app.json
 * 4. http://127.0.0.1:8000
 */
export function getApiBaseUrl(): string {
  const trim = (u: string) => u.replace(/\/$/, '');

  const fromEnv =
    typeof process !== 'undefined' ? (process.env.EXPO_PUBLIC_API_URL as string | undefined) : undefined;
  if (fromEnv?.startsWith('http')) return trim(fromEnv);

  if (typeof window !== 'undefined') {
    const host = window.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra?.startsWith('http')) return trim(fromExtra);

  return 'http://127.0.0.1:8000';
}
