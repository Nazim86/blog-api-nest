import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { appSettings } from './app.settings';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  appSettings(app);

  await app.listen(5000);
}
bootstrap();
