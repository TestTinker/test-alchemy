declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL?: string;
    STAGING_BASE_URL?: string;
    PROD_BASE_URL?: string;
    TEST_ENV?: 'dev' | 'staging' | 'prod';
    JIRA_BASE_URL?: string;
    JIRA_TOKEN?: string;
    JIRA_AUTH_TYPE?: 'Bearer' | 'Basic';
    JIRA_PROJECT_KEY?: string;
  }
}
