import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [BooksModule, UsersModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
