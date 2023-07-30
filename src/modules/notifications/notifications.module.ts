import { NotificationController } from './controller/notifications.controller';

import { Module } from '@nestjs/common';
import NotificationService from './service/notifications.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationsModule {}
