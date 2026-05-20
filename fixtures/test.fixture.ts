import { mergeTests } from '@playwright/test';
import { apiTest } from './api.fixture';
import { uiTest } from './ui.fixture';

export const test = mergeTests(uiTest, apiTest);
export { expect } from '@playwright/test';
