import { IService } from 'src/modules/interfaces/IService';
import {
  INotifications,
  notificationsValidationSchema,
} from '../dtos/notifications.dtos';
import NotificationModel from '../entities/notifications.entity';
import { SafeParseError } from 'zod';

class NotificationService implements IService<INotifications> {
  private _notifications: NotificationModel;

  constructor() {
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
    return notification.toObject();
  }

  public async create(data: INotifications): Promise<INotifications> {
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<INotifications> {
    try {
      const notification = await this._notifications.delete(id);
      return notification.toObject();
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<INotifications[]> {
    try {
      const notificationsFromDB = await this._notifications.read();
      const notifications = notificationsFromDB.map((notification) => ({
        ...notification.toObject(),
      }));

      notifications.sort(this.sortByDateCreation);

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<INotifications> {
    try {
      const notificationFromDB = await this._notifications.readOne(id);
      const notification = {
        ...notificationFromDB.toObject(),
      };
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
        ...notification.toObject(),
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
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }
}

export default NotificationService;
