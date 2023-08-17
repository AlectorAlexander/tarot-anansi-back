import NotificationService from '../../modules/notifications/service/notifications.service';
import BookingService from '../../modules/booking/service/booking.service';
import PaymentService from '../../modules/payments/service/payments.service';
import SchedulesService from '../../modules/schedules/service/schedules.service';
import SessionService from '../../modules/sessions/service/sessions.service'; // Import SessionService
import { IPayments } from '../../modules/payments/dtos/payments.dtos';
import { ISchedules } from '../../modules/schedules/dtos/schedules.dtos';
import { ISessions } from '../../modules/sessions/dtos/sessions.dtos'; // Import ISessions

// Create mocks for dependencies
jest.mock('../../modules/schedules/service/schedules.service');
jest.mock('../../modules/payments/service/payments.service');
jest.mock('../../modules/notifications/service/notifications.service');
jest.mock('../../modules/sessions/service/sessions.service'); // Mock SessionService

const MockNotificationService = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockSchedulesService: jest.Mocked<SchedulesService>;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockSessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    mockSchedulesService = new SchedulesService(
      new MockNotificationService(),
    ) as jest.Mocked<SchedulesService>;
    mockPaymentService = new PaymentService(
      new MockNotificationService(),
    ) as jest.Mocked<PaymentService>;
    mockSessionService = new SessionService() as jest.Mocked<SessionService>; // Initialize mock for SessionService
    bookingService = new BookingService(
      mockSchedulesService,
      mockPaymentService,
      mockSessionService, // Pass SessionService to BookingService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const scheduleId = '64c1423764cfbb9e80c36865';
      const userId = '64c1423764cfbb9e80c36865';
      const scheduleData: ISchedules = {
        _id: scheduleId,
        user_id: userId,
        status: 'pago',
        start_date: new Date('2023-07-01'),
        end_date: new Date('2023-07-02'),
      };

      const paymentData: IPayments = {
        schedule_id: scheduleId,
        price: 99.99,
        status: 'pago',
      };

      const sessionData: ISessions = {
        date: 'A sessão com este usuário está marcada para a data 30/06/2023 às 21:00',
        price: 99.99,
        schedule_id: '64c1423764cfbb9e80c36865',
      };

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.create.mockResolvedValue(scheduleData);
      mockPaymentService.create.mockResolvedValue(paymentData);
      mockSessionService.create.mockResolvedValue(sessionData); // Simulate session service response

      const booking = await bookingService.createBooking({
        scheduleData,
        paymentData,
        sessionData,
      });

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.create).toHaveBeenCalledWith(scheduleData);
      expect(mockPaymentService.create).toHaveBeenCalledWith(
        paymentData,
        userId,
      ); // Adicionado userId
      expect(mockSessionService.create).toHaveBeenCalledWith(sessionData); // Verify session service call

      // Verificando o resultado da criação da reserva
      expect(booking).toEqual({
        scheduleData,
        paymentData,
        sessionData,
      });
    });
  });

  // ... [Partes anteriores permanecem inalteradas]

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
      const sessionData =
        'Pagamento não realizado, portanto a sessão não foi marcada ainda';

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.readOne.mockResolvedValue(scheduleData);
      mockPaymentService.findByScheduleId.mockResolvedValue(paymentData);

      const booking = await bookingService.findBookingByScheduleId(scheduleId);

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.readOne).toHaveBeenCalledWith(scheduleId);
      expect(mockPaymentService.findByScheduleId).toHaveBeenCalledWith(
        scheduleId,
      );
      expect(mockSessionService.findByScheduleId).toHaveBeenCalledWith(
        scheduleId,
      ); // Verifique a chamada ao serviço de sessão

      // Verificando o resultado da busca da reserva
      expect(booking).toEqual({
        scheduleData,
        paymentData,
        sessionData,
      });
    });
  });

  describe('updateBooking', () => {
    // Antes do teste

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
      const updatedSessionData =
        'Pagamento não realizado, portanto a sessão não foi marcada ainda';

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.update.mockResolvedValue(updatedScheduleData);
      mockPaymentService.update.mockResolvedValue(updatedPaymentData);

      const updatedBooking = await bookingService.updateBooking(bookingId, {
        scheduleData: updatedScheduleData,
        paymentData: updatedPaymentData,
        sessionData: updatedSessionData,
      });

      // Verificando se os métodos dependentes foram chamados corretamente
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
        sessionData: updatedSessionData,
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

      const sessionData: ISessions[] = [];

      // Simulando o retorno das chamadas de serviço dependentes
      mockSchedulesService.findByUserId.mockResolvedValue(scheduleData);
      mockPaymentService.findByScheduleId.mockResolvedValue(paymentData[0]);
      mockSessionService.findByScheduleId.mockResolvedValue(sessionData[0]); // Simule o retorno do serviço de sessão

      const bookings = await bookingService.findBookingsByUser(userId);

      // Verificando se os métodos dependentes foram chamados corretamente
      expect(mockSchedulesService.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockPaymentService.findByScheduleId).toHaveBeenCalledWith(
        scheduleData[0]._id,
      );
      expect(mockSessionService.findByScheduleId).toHaveBeenCalledWith(
        scheduleData[0]._id,
      ); // Verifique a chamada ao serviço de sessão

      // Verificando o resultado da busca da reserva
      expect(bookings).toEqual([
        {
          scheduleData: scheduleData[0],
          paymentData: paymentData[0],
          sessionData: sessionData[0],
        },
      ]);
    });
  });
});
