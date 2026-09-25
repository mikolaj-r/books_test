import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  imports: [BooksModule, UsersModule],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
