import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as ngrok from 'ngrok';
import { appSettings } from './app.settings';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import process from 'process';
import { TelegramAdapter } from './api/infrastructure/adapters/telegram.adapter';

let baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000/';
async function connectToNgrok() {
  return await ngrok.connect(5000);
}
async function bootstrap() {
  const rawApp: INestApplication = await NestFactory.create(AppModule);

  const app = appSettings(rawApp);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Blogs example')
    .setDescription('The blogs API description')
    .setVersion('1.0')
    .addTag('blogs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(5000);

  const telegramAdapter = await app.resolve(TelegramAdapter);

  if (process.env.NODE_ENV === 'development') {
    baseUrl = await connectToNgrok();
    console.log('Ngrok URL: ', baseUrl);
  }

  await telegramAdapter.setWebhook(baseUrl + '/integrations/telegram/webhook');
}
bootstrap();
