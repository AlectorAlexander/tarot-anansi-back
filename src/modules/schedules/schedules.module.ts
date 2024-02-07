import { Module, forwardRef } from '@nestjs/common';
import { SchedulesController } from './controller/schedules.controller';
import SchedulesService from './service/schedules.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
  imports: [NotificationsModule, forwardRef(() => BookingModule)], // Usando forwardRef aqui
})
export class SchedulesModule {}
