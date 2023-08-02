import NotificationService from '../../modules/notifications/service/notifications.service';
import BookingService from '../../modules/booking/service/booking.service';
import PaymentService from '../../modules/payments/service/payments.service';
import SchedulesService from '../../modules/schedules/service/schedules.service';
import { IPayments } from '../../modules/payments/dtos/payments.dtos';
import { ISchedules } from '../../modules/schedules/dtos/schedules.dtos';

// Create mocks for dependencies
jest.mock('../../modules/schedules/service/schedules.service');
jest.mock('../../modules/payments/service/payments.service');
jest.mock('../../modules/notifications/service/notifications.service');
const MockNotificationService = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockSchedulesService: jest.Mocked<SchedulesService>;
  let mockPaymentService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    mockSchedulesService = new SchedulesService(
      new MockNotificationService(),
    ) as jest.Mocked<SchedulesService>;
    mockPaymentService = new PaymentService(
      new MockNotificationService(),
    ) as jest.Mocked<PaymentService>;
    bookingService = new BookingService(
      mockSchedulesService,
      mockPaymentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const scheduleData: ISchedules = {
        user_id: '64bafc9ee604f1df0dd36d06',
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      const paymentData: IPayments = {
        schedule_id: '64c1423764cfbb9e80c36865',
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      const paymentBody = {
        schedule_id: scheduleData._id,
        price: paymentData.price,
        status:
          scheduleData.status === 'concluído' ? 'pago' : scheduleData.status,
      };

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.create.mockResolvedValue(scheduleData);
      mockPaymentService.create.mockResolvedValue(paymentData);

      const booking = await bookingService.createBooking({
        scheduleData,
        paymentData,
      });

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.create).toHaveBeenCalledWith(scheduleData);
      expect(mockPaymentService.create).toHaveBeenCalledWith(paymentBody);

      // Verificando o resultado da criação da reserva
      expect(booking).toEqual({
        scheduleData,
        paymentData,
      });
    });
  });

  describe('findBookingByScheduleId', () => {
    it('should find a booking by schedule ID', async () => {
      // Dados fictícios para simular uma reserva
      const scheduleId = '64c1423764cfbb9e80c36865';
      const userId = '64c1423764cfbb9e80c36865';

      const scheduleData: ISchedules = {
        _id: scheduleId,
        user_id: userId,
        status: 'pendente',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      const paymentData: IPayments = {
        schedule_id: scheduleId,
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.readOne.mockResolvedValue(scheduleData);
      mockPaymentService.findByScheduleId.mockResolvedValue(paymentData);

      const booking = await bookingService.findBookingByScheduleId(scheduleId);

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.readOne).toHaveBeenCalledWith(scheduleId);
      expect(mockPaymentService.findByScheduleId).toHaveBeenCalledWith(
        scheduleId,
      );

      // Verificando o resultado da busca da reserva
      expect(booking).toEqual({
        scheduleData,
        paymentData,
      });
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      // Dados fictícios para simular uma reserva
      const bookingId = '64c1423764cfbb9e80c36865';
      const userId = '64bafc9ee604f1df0dd36d06';

      const updatedScheduleData: ISchedules = {
        _id: bookingId,
        user_id: userId,
        status: 'concluído',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      const updatedPaymentData: IPayments = {
        _id: '64bafc9ee604f1df0dd36d26',
        schedule_id: bookingId,
        price: 99.99,
        status: 'pago',
        date_creation: new Date(),
        date_update: new Date(),
      };

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.readOne.mockResolvedValue(updatedScheduleData);
      mockSchedulesService.update.mockResolvedValue(updatedScheduleData);
      mockPaymentService.update.mockResolvedValue(updatedPaymentData);
      mockPaymentService.findByScheduleId.mockResolvedValue(updatedPaymentData); // Adicione esta linha

      const updatedBooking = await bookingService.updateBooking(bookingId, {
        scheduleData: updatedScheduleData,
        paymentData: updatedPaymentData,
      });

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.readOne).toHaveBeenCalledWith(bookingId);
      expect(mockSchedulesService.update).toHaveBeenCalledWith(
        updatedScheduleData._id,
        updatedScheduleData,
      );
      expect(mockPaymentService.update).toHaveBeenCalledWith(
        updatedPaymentData._id,
        updatedPaymentData,
      );

      // Verificando o resultado da atualização da reserva
      expect(updatedBooking).toEqual({
        scheduleData: updatedScheduleData,
        paymentData: updatedPaymentData,
      });
    });
  });

  describe('findBookingsByUser', () => {
    it('should find bookings by user ID', async () => {
      // Dados fictícios para simular uma reserva
      const userId = '64bafc9ee604f1df0dd36d06';

      const scheduleData: ISchedules[] = [
        {
          _id: '64c1423764cfbb9e80c36865',
          user_id: userId,
          status: 'pendente',
          start_date: new Date('2023-07-01'),
          end_date: new Date('2023-07-02'),
        },
      ];

      const paymentData: IPayments[] = [
        {
          schedule_id: scheduleData[0]._id,
          price: 99.99,
          status: 'pago',
          date_creation: new Date(),
          date_update: new Date(),
        },
      ];

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.findByUserId.mockResolvedValue(scheduleData);
      mockPaymentService.findByScheduleId.mockResolvedValue(paymentData[0]);

      const bookings = await bookingService.findBookingsByUser(userId);

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockPaymentService.findByScheduleId).toHaveBeenCalledWith(
        scheduleData[0]._id,
      );

      // Verificando o resultado da busca da reserva
      expect(bookings).toEqual([
        {
          scheduleData: scheduleData[0],
          paymentData: paymentData[0],
        },
      ]);
    });
  });
});
