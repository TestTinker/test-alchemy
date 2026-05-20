import { spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import { exportJiraTicket } from '../integrations/jira/jira-ticket-exporter';

interface TicketContent {
  key: string;
  summary: string;
  steps: string[];
}

interface GeneratedAssets {
  pageObjectPaths: string[];
}

async function main(): Promise<void> {
  checkPlaywrightCliHelp();

  const ticketKeyInput = process.argv[2];

  if (!ticketKeyInput?.trim()) {
    throw new Error('Ticket key is required. Example: npm run jira:playwright -- QARDEX-1');
  }

  const ticketKey = ticketKeyInput.trim().toUpperCase();
  const ticketPath = await resolveTicketPath(ticketKey);
  const markdown = await readFile(ticketPath, 'utf8');
  const ticket = parseTicketMarkdown(markdown);
  testFlowWithPlaywrightCli(ticket);

  const specPath = path.join('tests', 'jira', `${ticket.key.toLowerCase()}.spec.ts`);
  const reportDir = path.join('reports', 'jira', `${ticket.key.toLowerCase()}.html`);
  const assets = await generateMissingPageObjects(ticket);

  await mkdir(path.dirname(specPath), { recursive: true });
  await mkdir(path.dirname(reportDir), { recursive: true });
  await rm(reportDir, { recursive: true, force: true });
  await writeFile(specPath, buildSpec(ticket), 'utf8');

  const testResult = runGeneratedSpec(specPath, reportDir);
  showPlaywrightReport(reportDir);

  console.log(`Playwright spec generated: ${specPath}`);
  for (const pageObjectPath of assets.pageObjectPaths) {
    console.log(`Page object generated: ${pageObjectPath}`);
  }
  console.log(`Playwright report generated: ${reportDir}`);

  if (!testResult.passed) {
    process.exitCode = testResult.exitCode;
  }
}

async function resolveTicketPath(ticketKey: string): Promise<string> {
  const existingPath = path.join('skills', 'jira', `${ticketKey}.md`);

  if (existsSync(existingPath)) {
    return existingPath;
  }

  const result = await exportJiraTicket({ ticketKeyInput: ticketKey });
  return result.outputPath;
}

function parseTicketMarkdown(markdown: string): TicketContent {
  const titleMatch = markdown.match(/^#\s+([A-Z0-9-]+):\s+(.+)$/m);

  if (!titleMatch) {
    throw new Error('Ticket markdown is missing a valid title.');
  }

  const descriptionMatch = markdown.match(/^##\s+Description\s*\r?\n([\s\S]*)/m);
  const description = descriptionMatch?.[1]?.trim() ?? '';
  const steps = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim());

  if (!steps.length) {
    throw new Error('No test steps were found in the ticket description.');
  }

  return {
    key: titleMatch[1],
    summary: titleMatch[2].trim(),
    steps,
  };
}

function buildSpec(ticket: TicketContent): string {
  const stepBlocks = ticket.steps
    .map((step, index) => buildStepBlock(step, index + 1, ticket))
    .join('\n\n');
  const usesCheckoutPage = hasCheckoutFlow(ticket);
  const usesGeneratedPage = hasGenericFlow(ticket);
  const generatedPageClassName = buildGeneratedPageClassName(ticket);
  const imports = [
    "import { test } from '../../fixtures/test.fixture';",
    usesCheckoutPage ? "import { CheckoutPage } from '../../pages/checkout.page';" : undefined,
    usesGeneratedPage ? `import { ${generatedPageClassName} } from '../../pages/${ticket.key.toLowerCase()}.page';` : undefined,
    "import webUsers from '../../test-data/static/web-users.json';",
  ].filter((value): value is string => Boolean(value));
  const setupLines = [
    usesCheckoutPage ? '  const checkoutPage = new CheckoutPage(page);' : undefined,
    usesGeneratedPage ? `  const generatedPage = new ${generatedPageClassName}(page);` : undefined,
  ].filter((value): value is string => Boolean(value));

  return [
    ...imports,
    '',
    `test('${ticket.key}: ${escapeSingleQuotes(ticket.summary)}', async ({ page, loginPage }) => {`,
    ...setupLines,
    setupLines.length ? '' : undefined,
    indent(stepBlocks, 2),
    '});',
    '',
  ].filter((value): value is string => value !== undefined).join('\n');
}

function checkPlaywrightCliHelp(): void {
  const result = spawnSync('playwright-cli', ['--help'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    const message = [
      'playwright-cli --help failed. Install or configure playwright-cli before running this agent.',
      result.stderr,
      result.error instanceof Error ? result.error.message : '',
    ].filter(Boolean).join('\n');

    throw new Error(message);
  }
}

function testFlowWithPlaywrightCli(ticket: TicketContent): void {
  if (!hasCheckoutFlow(ticket)) {
    console.log('playwright-cli flow test skipped: no supported generated CLI flow mapping for this ticket.');
    return;
  }

  const commands = [
    ['open', 'https://www.saucedemo.com/'],
    ['fill', '[data-test=username]', 'standard_user'],
    ['fill', '[data-test=password]', 'secret_sauce'],
    ['click', '[data-test=login-button]'],
    ['click', '[data-test=add-to-cart-sauce-labs-backpack]'],
    ['click', '[data-test=add-to-cart-sauce-labs-bike-light]'],
    ['click', '[data-test=shopping-cart-link]'],
    ['click', '[data-test=checkout]'],
    ['fill', '[data-test=firstName]', 'Test'],
    ['fill', '[data-test=lastName]', 'User'],
    ['fill', '[data-test=postalCode]', '10110'],
    ['click', '[data-test=continue]'],
    ['click', '[data-test=finish]'],
    ['snapshot'],
  ];

  let finalOutput = '';

  for (const args of commands) {
    const result = runPlaywrightCli(args);

    if (result.status !== 0) {
      throw new Error([
        `playwright-cli flow test failed while running: playwright-cli ${args.join(' ')}`,
        result.stderr,
        result.stdout,
        result.error instanceof Error ? result.error.message : '',
      ].filter(Boolean).join('\n'));
    }

    finalOutput = String(result.stdout ?? '');
  }

  if (!finalOutput.includes('Thank you for your order!')) {
    throw new Error('playwright-cli flow test failed: expected order confirmation text was not found.');
  }
}

function runPlaywrightCli(args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync('playwright-cli', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
}

interface PlaywrightRunResult {
  passed: boolean;
  exitCode: number;
  durationMs: number;
  summary: {
    total: number;
    expected: number;
    unexpected: number;
    flaky: number;
    skipped: number;
  };
  tests: Array<{
    title: string;
    status: string;
    durationMs: number;
    errorMessage?: string;
  }>;
  stdout: string;
  stderr: string;
}

function runGeneratedSpec(specPath: string, reportDir: string): PlaywrightRunResult {
  const runnableSpecPath = specPath.replace(/\\/g, '/');
  const runnableReportDir = reportDir.replace(/\\/g, '/');
  const result = spawnSync('npx', ['playwright', 'test', runnableSpecPath, '--reporter=html'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      PLAYWRIGHT_HTML_OPEN: 'never',
      PLAYWRIGHT_HTML_OUTPUT_DIR: runnableReportDir,
    },
    shell: process.platform === 'win32',
  });

  const stdout = result.stdout ?? '';
  const stderr = [
    result.stderr ?? '',
    result.error instanceof Error ? result.error.message : '',
  ].filter(Boolean).join('\n');
  const exitCode = result.status ?? 1;
  return {
    passed: exitCode === 0,
    exitCode,
    durationMs: 0,
    summary: {
      total: 0,
      expected: exitCode === 0 ? 1 : 0,
      unexpected: exitCode === 0 ? 0 : 1,
      flaky: 0,
      skipped: 0,
    },
    tests: [],
    stdout,
    stderr,
  };
}

function showPlaywrightReport(reportDir: string): void {
  const child = spawn('npx', ['playwright', 'show-report', reportDir.replace(/\\/g, '/')], {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    stdio: 'ignore',
    detached: true,
  });

  child.unref();
}

function buildStepBlock(step: string, stepNumber: number, ticket: TicketContent): string {
  const normalizedStep = normalizeStep(step);

  if (normalizedStep.includes('login with a valid credential')) {
    return buildWrappedStep(step, [
      'await loginPage.goto();',
      'await loginPage.login(webUsers.sauceDemo.standardUser.username, webUsers.sauceDemo.standardUser.password);',
      'await loginPage.expectInventoryPage();',
    ]);
  }

  if (normalizedStep.includes('add some products to cart')) {
    return buildWrappedStep(step, [
      'await checkoutPage.addSomeProductsToCart();',
    ]);
  }

  if (normalizedStep.includes('checkout from cart')) {
    return buildWrappedStep(step, [
      'await checkoutPage.checkoutFromCart();',
    ]);
  }

  if (normalizedStep.includes('fill your information')) {
    return buildWrappedStep(step, [
      'await checkoutPage.fillInformation();',
    ]);
  }

  if (normalizedStep.includes('verify the products')) {
    return buildWrappedStep(step, [
      "await checkoutPage.expectProducts(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);",
      "await checkoutPage.expectTotal('$43.18');",
    ]);
  }

  if (normalizedStep.includes('finish order')) {
    return buildWrappedStep(step, [
      'await checkoutPage.finishOrder();',
    ]);
  }

  if (normalizedStep.includes('thank you for your order')) {
    return buildWrappedStep(step, [
      'await checkoutPage.expectOrderComplete();',
    ]);
  }

  return buildWrappedStep(step, [
    `await generatedPage.${buildGeneratedStepMethodName(step, stepNumber)}();`,
  ]);
}

async function generateMissingPageObjects(ticket: TicketContent): Promise<GeneratedAssets> {
  const pageObjectPaths: string[] = [];

  if (hasCheckoutFlow(ticket)) {
    const checkoutPagePath = path.join('pages', 'checkout.page.ts');
    await mkdir(path.dirname(checkoutPagePath), { recursive: true });
    await writeFile(checkoutPagePath, buildCheckoutPageObject(), 'utf8');
    pageObjectPaths.push(checkoutPagePath);
  }

  if (hasGenericFlow(ticket)) {
    const generatedPagePath = path.join('pages', `${ticket.key.toLowerCase()}.page.ts`);
    await mkdir(path.dirname(generatedPagePath), { recursive: true });
    await writeFile(generatedPagePath, buildGeneratedPageObject(ticket), 'utf8');
    pageObjectPaths.push(generatedPagePath);
  }

  return { pageObjectPaths };
}

function hasCheckoutFlow(ticket: TicketContent): boolean {
  return ticket.steps.some((step) => {
    const normalizedStep = normalizeStep(step);

    return [
      'add some products to cart',
      'checkout from cart',
      'fill your information',
      'verify the products',
      'finish order',
      'thank you for your order',
    ].some((keyword) => normalizedStep.includes(keyword));
  });
}

function hasGenericFlow(ticket: TicketContent): boolean {
  return ticket.steps.some((step) => !isKnownStep(step));
}

function isKnownStep(step: string): boolean {
  const normalizedStep = normalizeStep(step);

  return [
    'login with a valid credential',
    'add some products to cart',
    'checkout from cart',
    'fill your information',
    'verify the products',
    'finish order',
    'thank you for your order',
  ].some((keyword) => normalizedStep.includes(keyword));
}

function buildCheckoutPageObject(): string {
  return [
    "import { expect, Page } from '@playwright/test';",
    "import { BasePage } from './base.page';",
    '',
    'export class CheckoutPage extends BasePage {',
    '  constructor(page: Page) {',
    '    super(page);',
    '  }',
    '',
    '  async addSomeProductsToCart(): Promise<void> {',
    '    await this.page.locator(\'[data-test="add-to-cart-sauce-labs-backpack"]\').click();',
    '    await this.page.locator(\'[data-test="add-to-cart-sauce-labs-bike-light"]\').click();',
    '    await expect(this.page.locator(\'[data-test="shopping-cart-badge"]\')).toHaveText(\'2\');',
    '  }',
    '',
    '  async checkoutFromCart(): Promise<void> {',
    '    await this.page.locator(\'[data-test="shopping-cart-link"]\').click();',
    '    await expect(this.page).toHaveURL(/cart/);',
    "    await expect(this.page.getByText('Your Cart')).toBeVisible();",
    '    await this.page.locator(\'[data-test="checkout"]\').click();',
    '    await expect(this.page).toHaveURL(/checkout-step-one/);',
    '  }',
    '',
    "  async fillInformation(firstName = 'Test', lastName = 'User', postalCode = '10110'): Promise<void> {",
    '    await this.page.locator(\'[data-test="firstName"]\').fill(firstName);',
    '    await this.page.locator(\'[data-test="lastName"]\').fill(lastName);',
    '    await this.page.locator(\'[data-test="postalCode"]\').fill(postalCode);',
    '    await this.page.locator(\'[data-test="continue"]\').click();',
    '    await expect(this.page).toHaveURL(/checkout-step-two/);',
    '  }',
    '',
    '  async expectProducts(productNames: string[]): Promise<void> {',
    '    for (const productName of productNames) {',
    '      await expect(this.page.getByText(productName)).toBeVisible();',
    '    }',
    '  }',
    '',
    '  async expectTotal(total: string): Promise<void> {',
    '    await expect(this.page.getByText(`Total: ${total}`)).toBeVisible();',
    '  }',
    '',
    '  async finishOrder(): Promise<void> {',
    '    await this.page.locator(\'[data-test="finish"]\').click();',
    '    await expect(this.page).toHaveURL(/checkout-complete/);',
    '  }',
    '',
    '  async expectOrderComplete(): Promise<void> {',
    "    await expect(this.page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();",
    "    await expect(this.page.getByText('Your order has been dispatched')).toBeVisible();",
    '  }',
    '}',
    '',
  ].join('\n');
}

function buildGeneratedPageObject(ticket: TicketContent): string {
  const methods = ticket.steps
    .map((step, index) => ({ step, stepNumber: index + 1 }))
    .filter(({ step }) => !isKnownStep(step))
    .map(({ step, stepNumber }) => buildGeneratedPageMethod(step, stepNumber))
    .join('\n\n');

  return [
    "import { Page } from '@playwright/test';",
    "import { BasePage } from './base.page';",
    '',
    `export class ${buildGeneratedPageClassName(ticket)} extends BasePage {`,
    '  constructor(page: Page) {',
    '    super(page);',
    '  }',
    '',
    indent(methods, 2),
    '}',
    '',
  ].join('\n');
}

function buildGeneratedPageMethod(step: string, stepNumber: number): string {
  return [
    `async ${buildGeneratedStepMethodName(step, stepNumber)}(): Promise<void> {`,
    `  throw new Error('TODO: Implement Jira step ${stepNumber}: ${escapeSingleQuotes(step)}');`,
    '}',
  ].join('\n');
}

function buildGeneratedPageClassName(ticket: TicketContent): string {
  return `${toPascalCase(ticket.key)}Page`;
}

function buildGeneratedStepMethodName(step: string, stepNumber: number): string {
  const baseName = toCamelCase(step);
  return baseName ? `${baseName}Step${stepNumber}` : `ticketStep${stepNumber}`;
}

function toPascalCase(value: string): string {
  const pascal = value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join('');

  return /^[A-Z]/.test(pascal) ? pascal : `Ticket${pascal}`;
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;
}

function buildWrappedStep(step: string, lines: string[]): string {
  return [
    `await test.step('${escapeSingleQuotes(step)}', async () => {`,
    indent(lines.join('\n'), 2),
    '});',
  ].join('\n');
}

function normalizeStep(step: string): string {
  return step.toLowerCase().replace(/["'.!]/g, '').replace(/\s+/g, ' ').trim();
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function indent(value: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
