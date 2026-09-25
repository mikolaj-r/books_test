import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';
import { ShelvesController } from './shelves.controller';
import { ShelvesService } from './shelves.service';

@Module({
  imports: [BooksModule, UsersModule],
  controllers: [ShelvesController],
  providers: [ShelvesService],
})
export class ShelvesModule {}
