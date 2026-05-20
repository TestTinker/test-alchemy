import { logger } from '../utils/logger';

async function seedData(): Promise<void> {
  logger.info('Seeding test data');
}

void seedData();
