import { Module } from '@nestjs/common';
import { EditionsAdminController } from './editions-admin.controller';
import { EditionsController } from './editions.controller';
import { EditionsService } from './editions.service';

@Module({
  controllers: [EditionsController, EditionsAdminController],
  providers: [EditionsService],
})
export class EditionsModule {}
