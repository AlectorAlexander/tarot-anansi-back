import { NotificationController } from './controller/notifications.controller';

import { Module } from '@nestjs/common';
import NotificationService from './service/notifications.service';
import { WebSocketGateway } from './gateway/notification.gateway';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, WebSocketGateway],
  exports: [NotificationService],
})
export class NotificationsModule {}
