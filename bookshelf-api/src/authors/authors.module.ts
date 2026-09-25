import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { AuthorsAdminController } from './authors-admin.controller';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [BooksModule],
  controllers: [AuthorsController, AuthorsAdminController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
