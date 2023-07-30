import { Document } from 'mongoose';
import {
  INotifications,
  notificationsValidationSchema,
} from '../../modules/notifications/dtos/notifications.dtos';
import NotificationModel from '../../modules/notifications/entities/notifications.entity';
import NotificationService from '../../modules/notifications/service/notifications.service';

// Create a mock NotificationModel for testing purposes
jest.mock('../../modules/notifications/entities//notifications.entity');
const MockNotificationModel = NotificationModel as jest.MockedClass<
  typeof NotificationModel
>;

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const notificationData: INotifications = {
        user_id: '64c1423764cfbb9e80c36865',
        message: 'Test notification',
        notification_date: new Date(),
        read: false,
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming NotificationModel.create resolves with the created notification
      MockNotificationModel.prototype.create.mockResolvedValue(
        notificationData as INotifications & Document,
      );

      const notification = await notificationService.create(notificationData);

      // Ensure NotificationModel.create is called with the correct arguments
      expect(MockNotificationModel.prototype.create).toHaveBeenCalledWith(
        notificationData,
      );

      // Ensure the notification is returned
      expect(notification).toEqual(notificationData);
    });

    it('should throw an error when notification data validation fails', async () => {
      const notificationData: INotifications = {
        user_id: '64c1423764cfbb9e80c36865',
        message: 'Test notification',
        notification_date: new Date(),
        read: false,
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming notificationsValidationSchema.safeParse fails validation
      const validationError = new Error(
        'Validation error (code: invalid_type)',
      );
      notificationsValidationSchema.safeParse = jest
        .fn()
        .mockReturnValue({ success: false });

      await expect(
        notificationService.create(notificationData),
      ).rejects.toThrowError(validationError);

      // Ensure notificationsValidationSchema.safeParse is called with the correct arguments
      expect(notificationsValidationSchema.safeParse).toHaveBeenCalledWith(
        notificationData,
      );
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      const notificationId = 'notification_id';

      // Assuming NotificationModel.delete resolves with the deleted notification
      MockNotificationModel.prototype.delete.mockResolvedValue({
        _id: notificationId,
      } as INotifications & Document);

      const deletedNotification = await notificationService.delete(
        notificationId,
      );

      // Ensure NotificationModel.delete is called with the correct arguments
      expect(MockNotificationModel.prototype.delete).toHaveBeenCalledWith(
        notificationId,
      );

      // Ensure the deleted notification is returned
      expect(deletedNotification).toEqual({ _id: notificationId });
    });
  });

  describe('read', () => {
    it('should read all notifications', async () => {
      const notificationsData: INotifications[] = [
        {
          _id: 'notification_id_1',
          user_id: 'user_id_1',
          message: 'Notification 1',
          notification_date: new Date(),
          read: false,
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'notification_id_2',
          user_id: 'user_id_2',
          message: 'Notification 2',
          notification_date: new Date(),
          read: true,
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming NotificationModel.read resolves with the notificationsData
      MockNotificationModel.prototype.read.mockResolvedValue(
        notificationsData as INotifications[] & Document[],
      );

      const notifications = await notificationService.read();

      // Ensure NotificationModel.read is called
      expect(MockNotificationModel.prototype.read).toHaveBeenCalled();

      // Ensure the notifications are returned
      expect(notifications).toEqual(notificationsData);
    });
  });

  describe('readOne', () => {
    it('should read a notification by ID', async () => {
      const notificationId = 'notification_id';
      const notificationData: INotifications = {
        _id: notificationId,
        user_id: '64c1423764cfbb9e80c36865',
        message: 'Test notification',
        notification_date: new Date(),
        read: false,
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming NotificationModel.readOne resolves with the notificationData
      MockNotificationModel.prototype.readOne.mockResolvedValue(
        notificationData as INotifications & Document,
      );

      const notification = await notificationService.readOne(notificationId);

      // Ensure NotificationModel.readOne is called with the correct arguments
      expect(MockNotificationModel.prototype.readOne).toHaveBeenCalledWith(
        notificationId,
      );

      // Ensure the notification is returned
      expect(notification).toEqual(notificationData);
    });
  });

  describe('findByUserId', () => {
    it('should find notifications by user ID', async () => {
      const userId = '64c1423764cfbb9e80c36865';
      const notificationsData: INotifications[] = [
        {
          _id: 'notification_id_1',
          user_id: userId,
          message: 'Notification 1',
          notification_date: new Date(),
          read: false,
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'notification_id_2',
          user_id: userId,
          message: 'Notification 2',
          notification_date: new Date(),
          read: true,
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming NotificationModel.read with user_id resolves with the notificationsData
      MockNotificationModel.prototype.read.mockResolvedValue(
        notificationsData as INotifications[] & Document[],
      );

      const notifications = await notificationService.findByUserId(userId);

      // Ensure NotificationModel.read with user_id is called with the correct arguments
      expect(MockNotificationModel.prototype.read).toHaveBeenCalledWith({
        user_id: userId,
      });

      // Ensure the notifications are returned
      expect(notifications).toEqual(notificationsData);
    });
  });

  describe('update', () => {
    it('should update a notification and return the updated notification', async () => {
      const notificationId = '64c1423764cfbb9e80c36865';
      const notificationData: INotifications = {
        user_id: '64c1423764cfbb9e80c36865',
        message: 'Test notification',
        notification_date: new Date(),
        read: false,
        date_creation: new Date(),
        date_update: new Date(),
      };
      // Assuming NotificationModel.update resolves with the updated notification
      MockNotificationModel.prototype.update.mockResolvedValue(
        notificationData as INotifications & Document,
      );

      const updatedNotification = await notificationService.update(
        notificationId,
        notificationData,
      );

      // Ensure NotificationModel.update is called with the correct arguments
      expect(MockNotificationModel.prototype.update).toHaveBeenCalledWith(
        notificationId,
        notificationData,
      );

      // Ensure the updated notification is returned
      expect(updatedNotification).toEqual(notificationData);
    });

    it('should throw an error when notification data validation fails', async () => {
      const notificationId = 'notification_id';
      const invalidNotificationData: INotifications = {
        user_id: 'this_is_invalid',
        message: 'Updated notification',
        notification_date: new Date(),
        read: true,
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming notificationsValidationSchema.safeParse fails validation
      const validationError = new Error(
        'Validation error (code: invalid_type)',
      );
      (notificationsValidationSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: 'Validation error', code: 'invalid_type' }],
        },
      });

      await expect(
        notificationService.update(notificationId, invalidNotificationData),
      ).rejects.toThrow(validationError);

      // Ensure notificationsValidationSchema.safeParse is called with the correct arguments
      expect(notificationsValidationSchema.safeParse).toHaveBeenCalledWith(
        invalidNotificationData,
      );
    });
  });
});
