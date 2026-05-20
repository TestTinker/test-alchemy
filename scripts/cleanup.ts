import { logger } from '../utils/logger';

async function cleanup(): Promise<void> {
  logger.info('Cleaning generated test data');
}

void cleanup();
