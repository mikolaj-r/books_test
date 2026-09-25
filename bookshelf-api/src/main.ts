import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/pipes/validation-exception.factory';
import { Env } from './config/env';

const parseOrigins = (value: string) =>
  value === '*' ? '*' : value.split(',').map((origin) => origin.trim());

const API_DESCRIPTION = [
  'REST API for readers: a book catalog imported from Open Library dumps, ratings and reviews, a reading library, shelves and yearly reading goals.',
  '',
  'All routes live under `/api/v1`. Register or log in, click **Authorize** and paste the `accessToken` (valid for 15 minutes); use `POST /auth/refresh` to rotate the token pair.',
  'Public routes marked as accepting an optional token personalize the response when a valid token is sent.',
  '',
  'List endpoints return `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }`. Every error has the shape `{ "statusCode", "code", "message", "details", "path", "timestamp" }`.',
].join('\n');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: parseOrigins(config.get('CORS_ORIGIN', { infer: true })),
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookshelf API')
    .setDescription(API_DESCRIPTION)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Liveness of the API and its database')
    .addTag(
      'Auth',
      'Registration, login, refresh token rotation, logout and password change',
    )
    .addTag(
      'Users',
      'Current user profile, public profiles and user administration',
    )
    .addTag(
      'Books',
      'Catalog of books (Open Library works): search, filters, details and admin CRUD',
    )
    .addTag('Authors', 'Authors of the catalog and their books')
    .addTag('Editions', 'Editions of books, looked up by id or ISBN')
    .addTag('Genres', 'Genres derived from Open Library subjects')
    .addTag('Ratings', 'Ratings on the 1-10 scale with optional reviews')
    .addTag('Library', 'Reading status of books: want to read, reading, read')
    .addTag('Shelves', 'Public and private book collections')
    .addTag('Reading goals', 'Yearly reading goals and their progress')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, swaggerConfig),
    { swaggerOptions: { persistAuthorization: true } },
  );

  app.enableShutdownHooks();
  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
