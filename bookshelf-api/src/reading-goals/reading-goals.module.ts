import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ReadingGoalsController } from './reading-goals.controller';
import { ReadingGoalsService } from './reading-goals.service';

@Module({
  imports: [UsersModule],
  controllers: [ReadingGoalsController],
  providers: [ReadingGoalsService],
})
export class ReadingGoalsModule {}
