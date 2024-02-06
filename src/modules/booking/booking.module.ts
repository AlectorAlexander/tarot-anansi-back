import { PaymentModule } from '../payments/payments.module';
import { Module } from '@nestjs/common';
import { BookingController } from './controller/booking.controller';
import BookingService from './service/booking.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { sessionsModule } from '../sessions/sessions.module';
import { GoogleCalendarController } from './google-calendar/google-calendar.controller';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';

@Module({
  controllers: [BookingController, GoogleCalendarController],
  providers: [BookingService, GoogleCalendarService],
  imports: [SchedulesModule, PaymentModule, sessionsModule],
})
export class BookingModule {}
