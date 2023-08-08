import { Module } from '@nestjs/common';
import { PaymentController } from './controller/payments.controller';
import PaymentService from './service/payments.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
  imports: [NotificationsModule],
})
export class PaymentModule {}
