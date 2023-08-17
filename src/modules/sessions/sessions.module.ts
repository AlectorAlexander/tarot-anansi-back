import { Module } from '@nestjs/common';
import SessionsService from './service/sessions.service';
import { SessionsController } from './controller/sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class sessionsModule {}
