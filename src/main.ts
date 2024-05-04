import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import normalizePort from './utils/normalizePort';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('PORT');
  await app.listen(normalizePort(PORT) || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
