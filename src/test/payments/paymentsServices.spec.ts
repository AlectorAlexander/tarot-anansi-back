import { Document } from 'mongoose';
import {
  IPayments,
  paymentsValidationSchema,
} from '../../modules/payments/dtos/payments.dtos';
import PaymentsModel from '../../modules/payments/entities/payments.entity';
import PaymentService from '../../modules/payments/service/payments.service';
import NotificationService from '../../modules/notifications/service/notifications.service';

// Create a mock PaymentsModel for testing purposes
jest.mock('../../modules/payments/entities/payments.entity');
const MockPaymentsModel = PaymentsModel as jest.MockedClass<
  typeof PaymentsModel
>;
jest.mock('../../modules/notifications/service/notifications.service');
const MockNotificationService = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService(new MockNotificationService());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const paymentData: IPayments = {
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming PaymentsModel.create resolves with the created payment
      MockPaymentsModel.prototype.create.mockResolvedValue(
        paymentData as IPayments & Document,
      );

      const payment = await paymentService.create(paymentData);

      // Ensure PaymentsModel.create is called with the correct arguments
      expect(MockPaymentsModel.prototype.create).toHaveBeenCalledWith(
        paymentData,
      );

      // Ensure the payment is returned
      expect(payment).toEqual(paymentData);
    });

    it('should throw an error when payment data validation fails', async () => {
      const paymentData: IPayments = {
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

      await expect(paymentService.create(paymentData)).rejects.toThrowError(
        validationError,
      );

      // Ensure paymentsValidationSchema.safeParse is called with the correct arguments
      expect(paymentsValidationSchema.safeParse).toHaveBeenCalledWith(
        paymentData,
      );
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      const paymentId = 'payment_id';

      // Assuming PaymentsModel.delete resolves with the deleted payment
      MockPaymentsModel.prototype.delete.mockResolvedValue({
        _id: paymentId,
      } as IPayments & Document);

      const deletedPayment = await paymentService.delete(paymentId);

      // Ensure PaymentsModel.delete is called with the correct arguments
      expect(MockPaymentsModel.prototype.delete).toHaveBeenCalledWith(
        paymentId,
      );

      // Ensure the deleted payment is returned
      expect(deletedPayment).toEqual({ _id: paymentId });
    });
  });

  describe('read', () => {
    it('should read all payments', async () => {
      const paymentsData: IPayments[] = [
        {
          _id: 'payment_id_1',
          schedule_id: 'user_id_1',
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'payment_id_2',
          schedule_id: 'user_id_2',
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming PaymentsModel.read resolves with the paymentsData
      MockPaymentsModel.prototype.read.mockResolvedValue(
        paymentsData as IPayments[] & Document[],
      );

      const payments = await paymentService.read();

      // Ensure PaymentsModel.read is called
      expect(MockPaymentsModel.prototype.read).toHaveBeenCalled();

      // Ensure the payments are returned
      expect(payments).toEqual(paymentsData);
    });
  });

  describe('readOne', () => {
    it('should read a payment by ID', async () => {
      const paymentId = 'payment_id';
      const paymentData: IPayments = {
        _id: paymentId,
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Assuming PaymentsModel.readOne resolves with the paymentData
      MockPaymentsModel.prototype.readOne.mockResolvedValue(
        paymentData as IPayments & Document,
      );

      const payment = await paymentService.readOne(paymentId);

      // Ensure PaymentsModel.readOne is called with the correct arguments
      expect(MockPaymentsModel.prototype.readOne).toHaveBeenCalledWith(
        paymentId,
      );

      // Ensure the payment is returned
      expect(payment).toEqual(paymentData);
    });
  });

  describe('findByScheduleId', () => {
    it('should find payments by schedule ID', async () => {
      const scheduleId = '64c1423764cfbb9e80c36865';
      const paymentsData: IPayments[] = [
        {
          _id: 'payment_id_1',
          schedule_id: scheduleId,
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
        {
          _id: 'payment_id_2',
          schedule_id: '64c1423764cfbb9e80c36861',
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Assuming PaymentsModel.read with schedule_id resolves with the paymentsData
      MockPaymentsModel.prototype.read.mockResolvedValue(
        paymentsData as IPayments[] & Document[],
      );

      const payment = await paymentService.findByScheduleId(scheduleId);

      // Ensure PaymentsModel.read with schedule_id is called with the correct arguments
      expect(MockPaymentsModel.prototype.read).toHaveBeenCalledWith({
        schedule_id: scheduleId,
      });

      // Ensure the first payment with the correct schedule_id is returned
      expect(payment).toEqual(paymentsData[0]);
    });
  });
});
