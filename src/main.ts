import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { appSettings } from './app.settings';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
}
bootstrap();
