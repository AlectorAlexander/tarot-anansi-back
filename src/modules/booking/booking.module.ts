import { PaymentModule } from '../payments/payments.module';
import { Module } from '@nestjs/common';
import { BookingController } from './controller/booking.controller';
import BookingService from './service/booking.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { sessionsModule } from '../sessions/sessions.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [SchedulesModule, PaymentModule, sessionsModule],
})
export class BookingModule {}
