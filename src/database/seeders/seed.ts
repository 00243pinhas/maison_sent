import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: false,
  });

  try {
    await app.get(SeederService).run();
    logger.log('Seeding completed');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
