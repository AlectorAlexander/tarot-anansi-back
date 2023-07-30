import { Document } from 'mongoose';
import {
  IPayments,
  paymentsValidationSchema,
} from '../../modules/payments/dtos/payments.dtos';
import PaymentsModel from '../../modules/payments/entities/payments.entity';
import PaymentService from '../../modules/payments/service/payments.service';

// Create a mock PaymentsModel for testing purposes
jest.mock('../../modules/payments/entities//payments.entity');
const MockNotificationModel = PaymentsModel as jest.MockedClass<
  typeof PaymentsModel
>;

describe('PaymentService', () => {
  let notificationService: PaymentService;

  beforeEach(() => {
    notificationService = new PaymentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const notificationData: IPayments = {
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming PaymentsModel.create resolves with the created notification
      MockNotificationModel.prototype.create.mockResolvedValue(
        notificationData as IPayments & Document,
      );

      const notification = await notificationService.create(notificationData);

      // Ensure PaymentsModel.create is called with the correct arguments
      expect(MockNotificationModel.prototype.create).toHaveBeenCalledWith(
        notificationData,
      );

      // Ensure the notification is returned
      expect(notification).toEqual(notificationData);
    });

    it('should throw an error when notification data validation fails', async () => {
      const notificationData: IPayments = {
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pendente',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming paymentsValidationSchema.safeParse fails validation
      const validationError = new Error(
        'Validation error (code: invalid_type)',
      );
      paymentsValidationSchema.safeParse = jest
        .fn()
        .mockReturnValue({ success: false });

      await expect(
        notificationService.create(notificationData),
      ).rejects.toThrowError(validationError);

      // Ensure paymentsValidationSchema.safeParse is called with the correct arguments
      expect(paymentsValidationSchema.safeParse).toHaveBeenCalledWith(
        notificationData,
      );
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      const notificationId = 'notification_id';

      // Assuming PaymentsModel.delete resolves with the deleted notification
      MockNotificationModel.prototype.delete.mockResolvedValue({
        _id: notificationId,
      } as IPayments & Document);

      const deletedNotification = await notificationService.delete(
        notificationId,
      );

      // Ensure PaymentsModel.delete is called with the correct arguments
      expect(MockNotificationModel.prototype.delete).toHaveBeenCalledWith(
        notificationId,
      );

      // Ensure the deleted notification is returned
      expect(deletedNotification).toEqual({ _id: notificationId });
    });
  });

  describe('read', () => {
    it('should read all notifications', async () => {
      const notificationsData: IPayments[] = [
        {
          _id: 'notification_id_1',
          schedule_id: 'user_id_1',
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'notification_id_2',
          schedule_id: 'user_id_2',
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming PaymentsModel.read resolves with the notificationsData
      MockNotificationModel.prototype.read.mockResolvedValue(
        notificationsData as IPayments[] & Document[],
      );

      const notifications = await notificationService.read();

      // Ensure PaymentsModel.read is called
      expect(MockNotificationModel.prototype.read).toHaveBeenCalled();

      // Ensure the notifications are returned
      expect(notifications).toEqual(notificationsData);
    });
  });

  describe('readOne', () => {
    it('should read a notification by ID', async () => {
      const notificationId = 'notification_id';
      const notificationData: IPayments = {
        _id: notificationId,
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming PaymentsModel.readOne resolves with the notificationData
      MockNotificationModel.prototype.readOne.mockResolvedValue(
        notificationData as IPayments & Document,
      );

      const notification = await notificationService.readOne(notificationId);

      // Ensure PaymentsModel.readOne is called with the correct arguments
      expect(MockNotificationModel.prototype.readOne).toHaveBeenCalledWith(
        notificationId,
      );

      // Ensure the notification is returned
      expect(notification).toEqual(notificationData);
    });
  });

  describe('findByUserId', () => {
    it('should find notifications by user ID', async () => {
      const scheduleId = '64c1423764cfbb9e80c36865';
      const notificationsData: IPayments[] = [
        {
          _id: 'notification_id_1',
          schedule_id: scheduleId,
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'notification_id_2',
          schedule_id: scheduleId,
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming PaymentsModel.read with schedule_id resolves with the notificationsData
      MockNotificationModel.prototype.read.mockResolvedValue(
        notificationsData as IPayments[] & Document[],
      );

      const notifications = await notificationService.findByScheduleId(
        scheduleId,
      );

      // Ensure PaymentsModel.read with schedule_id is called with the correct arguments
      expect(MockNotificationModel.prototype.read).toHaveBeenCalledWith({
        schedule_id: scheduleId,
      });

      // Ensure the notifications are returned
      expect(notifications).toEqual(notificationsData);
    });
  });
});
