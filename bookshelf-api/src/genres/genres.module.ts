import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { GenresAdminController } from './genres-admin.controller';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [BooksModule],
  controllers: [GenresController, GenresAdminController],
  providers: [GenresService],
})
export class GenresModule {}
