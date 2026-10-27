import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';
import { SystemContentController } from './system-content.controller.js';
import { SystemContentService } from './system-content.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SystemContentController],
  providers: [SystemContentService],
  exports: [SystemContentService],
})
export class SystemModule {}
