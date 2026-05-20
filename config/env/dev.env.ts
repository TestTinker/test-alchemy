import { AppEnvironment, getEnvVar } from './env';

export const devEnv: AppEnvironment = {
  name: 'dev',
  baseUrl: getEnvVar('BASE_URL', 'http://localhost:3000'),
};
