import { Module } from '@nestjs/common';
import { SchedulesController } from './controller/schedules.controller';
import SchedulesService from './service/schedules.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
  imports: [NotificationsModule],
})
export class SchedulesModule {}
