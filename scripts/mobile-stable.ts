import { spawn, spawnSync } from 'node:child_process';

const EMULATORS = ['emulator-5554', 'emulator-5556'];
const DEFAULT_TEST_ARGS = [
  'mobilewright',
  'test',
  '--config=mobilewright.config.ts',
  'tests/mobile/add.alarm.spec.ts',
  'tests/mobile/add.contact.spec.ts',
  '--workers',
  '2',
  '--timeout=60000',
];

function runCommand(command: string, args: string[], options?: { allowFailure?: boolean }): string {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: 'pipe',
    shell: false,
  });

  const stdout = result.stdout?.trim() ?? '';
  const stderr = result.stderr?.trim() ?? '';

  if (result.status !== 0 && !options?.allowFailure) {
    const output = [stdout, stderr].filter(Boolean).join('\n');
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`);
  }

  return stdout;
}

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForBootCompleted(serial: string, timeoutMs = 120_000): void {
  const startedAt = Date.now();

  runCommand('adb', ['-s', serial, 'wait-for-device']);

  while (Date.now() - startedAt < timeoutMs) {
    const bootCompleted = runCommand('adb', ['-s', serial, 'shell', 'getprop', 'sys.boot_completed'], {
      allowFailure: true,
    }).replace(/\s+/g, '');

    if (bootCompleted === '1') {
      return;
    }

    sleep(1000);
  }

  throw new Error(`Timed out waiting for ${serial} to finish booting.`);
}

function verifyEmulatorsPresent(timeoutMs = 60_000): void {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const devicesOutput = runCommand('adb', ['devices'], { allowFailure: true });
    const allReady = EMULATORS.every((serial) => devicesOutput.includes(`${serial}\tdevice`));

    if (allReady) {
      return;
    }

    sleep(1000);
  }

  const devicesOutput = runCommand('adb', ['devices'], { allowFailure: true });
  throw new Error(`Expected emulators to be online.\n${devicesOutput}`);
}

function parseArgs(args: string[]): { files: string[]; options: string[]; workers: number } {
  const files: string[] = [];
  const options: string[] = [];
  let workers = 1;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--workers') {
      const value = args[i + 1] ?? '1';
      workers = Number(value) || 1;
      options.push('--workers', value);
      i++;
      continue;
    }

    if (arg.startsWith('--workers=')) {
      workers = Number(arg.split('=')[1]) || 1;
      options.push(arg);
      continue;
    }

    if (!arg.startsWith('-') && /\.(spec|test)\.ts$/.test(arg)) {
      files.push(arg);
      continue;
    }

    options.push(arg);
  }

  return { files, options, workers };
}

function replaceWorkers(options: string[], workers: number): string[] {
  const normalized: string[] = [];

  for (let i = 0; i < options.length; i++) {
    const arg = options[i];

    if (arg === '--workers') {
      i++;
      continue;
    }

    if (arg.startsWith('--workers=')) {
      continue;
    }

    normalized.push(arg);
  }

  normalized.push('--workers', String(workers));
  return normalized;
}

async function runMobilewright(command: string, args: string[], label: string): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        MOBILE_DEBUG_SCREENSHOTS: process.env.MOBILE_DEBUG_SCREENSHOTS ?? '0',
      },
    });

    child.once('error', reject);
    child.once('close', (code) => {
      console.log(`${label} exited with code ${code ?? 1}`);
      resolve(code ?? 1);
    });
  });
}

function resetAdbAndWait(): void {
  console.log('Resetting adb server...');
  runCommand('adb', ['kill-server'], { allowFailure: true });
  runCommand('adb', ['start-server']);

  console.log('Verifying emulator availability...');
  verifyEmulatorsPresent();

  for (const serial of EMULATORS) {
    console.log(`Waiting for ${serial} to finish booting...`);
    waitForBootCompleted(serial);
  }
}

async function runWithRetry(command: string, args: string[], label: string, retries = 1): Promise<number> {
  let attempt = 0;

  while (attempt <= retries) {
    const code = await runMobilewright(command, args, `${label} (attempt ${attempt + 1})`);
    if (code === 0) {
      return 0;
    }

    attempt++;
    if (attempt > retries) {
      return code;
    }

    console.log(`${label} failed; resetting adb/emulators before retry ${attempt + 1}.`);
    resetAdbAndWait();
  }

  return 1;
}

async function main(): Promise<void> {
  resetAdbAndWait();

  const forwardedArgs = process.argv.slice(2);
  const mobilewrightArgs = forwardedArgs.length > 0 ? ['mobilewright', 'test', ...forwardedArgs] : DEFAULT_TEST_ARGS;
  const parsed = parseArgs(mobilewrightArgs.slice(2));
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd.exe' : 'npx';
  const prefix = isWindows ? ['cmd.exe', '/c', 'npx'] : ['npx'];

  if (parsed.workers > 1 && parsed.files.length > 1) {
    console.log('Running mobile specs sequentially for stable local execution.');
    const sharedOptions = replaceWorkers(parsed.options, 1);

    for (const [index, file] of parsed.files.entries()) {
      const invocation = ['mobilewright', 'test', ...sharedOptions, file];
      const args = isWindows ? ['/c', 'npx', ...invocation] : invocation;
      console.log(`Run ${index + 1}: ${prefix.join(' ')} ${invocation.join(' ')}`);
      const code = await runWithRetry(command, args, `Run ${index + 1}`, 1);
      if (code !== 0) {
        process.exit(code);
      }
    }

    process.exit(0);
  }

  const args = isWindows ? ['/c', 'npx', ...mobilewrightArgs] : mobilewrightArgs;
  console.log(`Running: ${prefix.join(' ')} ${mobilewrightArgs.join(' ')}`);
  const code = await runWithRetry(command, args, 'Run 1', 1);
  process.exit(code);
}

void main();
