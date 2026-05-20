import { AppEnvironment, getEnvVar } from './env';

export const prodEnv: AppEnvironment = {
  name: 'prod',
  baseUrl: getEnvVar('PROD_BASE_URL', 'https://example.com'),
};
