import { existsSync, readFileSync } from 'fs';
import path from 'path';

export type JiraAuthType = 'Bearer' | 'Basic';

export interface JiraConfig {
  baseUrl: string;
  token: string;
  authType: JiraAuthType;
}

interface JiraProcessEnv {
  JIRA_BASE_URL?: string;
  JIRA_TOKEN?: string;
  JIRA_AUTH_TYPE?: string;
}

function readEnv(): JiraProcessEnv {
  const fileEnv = readDotEnvFile();

  if (typeof process === 'undefined') {
    return fileEnv;
  }

  return {
    ...fileEnv,
    ...process.env,
  };
}

function readDotEnvFile(): JiraProcessEnv {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return {};
  }

  return readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce<JiraProcessEnv>((env, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return env;
      }

      const separatorIndex = trimmedLine.indexOf('=');

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());

      if (isJiraEnvKey(key)) {
        env[key] = value;
      }

      return env;
    }, {});
}

function isJiraEnvKey(key: string): key is keyof JiraProcessEnv {
  return key === 'JIRA_BASE_URL' || key === 'JIRA_TOKEN' || key === 'JIRA_AUTH_TYPE';
}

function unquoteEnvValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function resolveAuthType(value: string | undefined): JiraAuthType {
  return value === 'Basic' ? 'Basic' : 'Bearer';
}

export function getJiraConfig(): JiraConfig {
  const env = readEnv();
  const baseUrl = env.JIRA_BASE_URL?.trim();
  const token = env.JIRA_TOKEN?.trim();

  if (!baseUrl) {
    throw new Error('JIRA_BASE_URL is required.');
  }

  if (!token) {
    throw new Error('JIRA_TOKEN is required.');
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    token,
    authType: resolveAuthType(env.JIRA_AUTH_TYPE),
  };
}
