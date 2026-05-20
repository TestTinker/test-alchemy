export type AppEnvironmentName = 'dev' | 'staging' | 'prod';

export interface AppEnvironment {
  name: AppEnvironmentName;
  baseUrl: string;
}

interface ProcessEnvShape {
  BASE_URL?: string;
  STAGING_BASE_URL?: string;
  PROD_BASE_URL?: string;
  TEST_ENV?: string;
}

function readProcessEnv(): ProcessEnvShape {
  if (typeof process === 'undefined') {
    return {};
  }

  return process.env ?? {};
}

export function getEnvVar(key: keyof ProcessEnvShape, fallback: string): string {
  const value = readProcessEnv()[key];
  return value && value.trim().length > 0 ? value : fallback;
}
