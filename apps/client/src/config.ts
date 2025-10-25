/**
 * Client configuration
 * Centralized environment variable access
 */

const getServerUrl = (): string => {
  // In production, use the environment variable or default to same origin
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SERVER_URL || window.location.origin;
  }

  // In development, use env var or localhost
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
};

export const config = {
  serverUrl: getServerUrl(),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
