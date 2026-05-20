import { devEnv } from './env/dev.env';
import { getEnvVar, type AppEnvironment, type AppEnvironmentName } from './env/env';
import { prodEnv } from './env/prod.env';
import { stagingEnv } from './env/staging.env';

interface TestConfig {
  environment: AppEnvironmentName;
  baseUrl: string;
  retries: number;
}

const environments: Record<AppEnvironmentName, AppEnvironment> = {
  dev: devEnv,
  staging: stagingEnv,
  prod: prodEnv,
};

function isAppEnvironmentName(value: string): value is AppEnvironmentName {
  return value in environments;
}

function resolveEnvironment(): AppEnvironment {
  const envName = getEnvVar('TEST_ENV', 'dev');
  return isAppEnvironmentName(envName) ? environments[envName] : devEnv;
}

const activeEnvironment = resolveEnvironment();

export const testConfig: TestConfig = {
  environment: activeEnvironment.name,
  baseUrl: activeEnvironment.baseUrl,
  retries: 1,
};
