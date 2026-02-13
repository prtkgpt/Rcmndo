// API configuration for Capacitor builds
// In the iOS app, API calls need to go to the hosted server

const isCapacitor = typeof window !== 'undefined' &&
  (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

// Base URL for API calls
// - Web: relative URLs (same origin)
// - iOS app: absolute URLs to hosted server
export const API_BASE_URL = isCapacitor
  ? 'https://rcmndo.com'
  : '';

// Helper to construct API URLs
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

// Fetch wrapper that handles the base URL
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...options,
    credentials: 'include', // Include cookies for auth
  });
}
