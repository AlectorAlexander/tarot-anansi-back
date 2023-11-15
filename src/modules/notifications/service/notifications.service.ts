import { WebSocketGateway } from './../gateway/notification.gateway';
import { IService } from 'src/modules/interfaces/IService';
import {
  INotifications,
  notificationsValidationSchema,
} from '../dtos/notifications.dtos';
import NotificationModel from '../entities/notifications.entity';
import { SafeParseError } from 'zod';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class NotificationService implements IService<INotifications> {
  private _notifications: NotificationModel;
  constructor(
    @Inject(WebSocketGateway) private notificationGateway: WebSocketGateway,
  ) {
    this._notifications = new NotificationModel();
  }

  private sortByDateCreation(a: INotifications, b: INotifications): number {
    const dateA = a.date_creation || new Date(0);
    const dateB = b.date_creation || new Date(0);
    return dateA.getTime() - dateB.getTime();
  }

  private async validateDataAndCreate(
    data: INotifications,
  ): Promise<INotifications> {
    const parsed = notificationsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<INotifications>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const notification = await this._notifications.create(data);
    return notification;
  }

  public async create(data: INotifications): Promise<INotifications> {
    try {
      const notification = await this.validateDataAndCreate(data);
      this.notificationGateway.sendNotificationToUser(notification);
      return notification;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<INotifications> {
    try {
      return await this._notifications.delete(id);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<INotifications[]> {
    try {
      const notificationsFromDB = await this._notifications.read();
      const notifications = notificationsFromDB.map((notification) => ({
        ...notification,
      }));

      notifications.sort(this.sortByDateCreation);

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<INotifications> {
    try {
      const notification = await this._notifications.readOne(id);
      return notification;
    } catch (error) {
      throw error;
    }
  }

  public async findByUserId(userId: string): Promise<INotifications[]> {
    try {
      const notificationsFromDB = await this._notifications.read({
        user_id: userId,
      });
      const notifications = notificationsFromDB.map((notification) => ({
        ...notification,
      }));

      notifications.sort(this.sortByDateCreation);

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    id: string,
    data: INotifications,
  ): Promise<INotifications> {
    const parsed = notificationsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<INotifications>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedNotification = await this._notifications.update(id, data);
      return updatedNotification;
    } catch (error) {
      throw error;
    }
  }
}

export default NotificationService;
