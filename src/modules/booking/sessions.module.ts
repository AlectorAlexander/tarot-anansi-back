
import { Module } from '@nestjs/common';
import { SessionsController } from './controller/sessions.controller';
import { SessionsService } from './service/booking.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
