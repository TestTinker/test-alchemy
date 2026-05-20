import { AppEnvironment, getEnvVar } from './env';

export const stagingEnv: AppEnvironment = {
  name: 'staging',
  baseUrl: getEnvVar('STAGING_BASE_URL', 'https://staging.example.com'),
};
