import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validateEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { EditionsModule } from './editions/editions.module';
import { GenresModule } from './genres/genres.module';
import { HealthModule } from './health/health.module';
import { LibraryModule } from './library/library.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReadingGoalsModule } from './reading-goals/reading-goals.module';
import { ShelvesModule } from './shelves/shelves.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    BooksModule,
    AuthorsModule,
    EditionsModule,
    GenresModule,
    RatingsModule,
    LibraryModule,
    ShelvesModule,
    ReadingGoalsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
