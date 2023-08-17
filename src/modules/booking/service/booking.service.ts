import { Injectable } from '@nestjs/common';
import { ISchedules } from '../..//schedules/dtos/schedules.dtos';
import PaymentService from '../../payments/service/payments.service';
import SchedulesService from '../../schedules/service/schedules.service';
import { IPayments } from '../../payments/dtos/payments.dtos';
import SessionsService from '../../sessions/service/sessions.service';
import { ISessions } from '../../sessions/dtos/sessions.dtos';

export type IBookingData = {
  scheduleData: ISchedules;
  paymentData: IPayments;
  sessionData: ISessions | string;
};

@Injectable()
class BookingService {
  constructor(
    private schedulesService: SchedulesService,
    private paymentService: PaymentService,
    private sessionService: SessionsService,
  ) {}

  async createBooking(data: IBookingData): Promise<IBookingData> {
    try {
      const { scheduleData, paymentData } = data;
      const schedule = await this.schedulesService.create(scheduleData);
      const schedule_id =
        typeof schedule._id !== 'string'
          ? schedule.user_id?.toString()
          : schedule._id;
      const user_id = schedule.user_id.toString();

      const paymentBody: IPayments = {
        schedule_id,
        price: paymentData.price,
        status: schedule.status === 'concluído' ? 'pago' : schedule.status,
      };

      const payment = await this.paymentService.create(paymentBody, user_id);
      const booking: IBookingData = {
        scheduleData: schedule,
        paymentData: payment,
        sessionData:
          'Pagamento não realizado, portanto a sessão não foi marcada ainda',
      };
      if (payment.status === 'pago') {
        const startDate = new Date(scheduleData.start_date);
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0'); // +1 porque os meses começam em 0
        const year = startDate.getFullYear();
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');

        const sessionBody = {
          schedule_id: schedule_id,
          date: `A sessão com este usuário está marcada para a data ${day}/${month}/${year} às ${hours}:${minutes}`,
          price: paymentData.price,
        };
        const session = await this.sessionService.create(sessionBody);
        booking.sessionData = session;
      }

      return booking;
    } catch (error) {
      throw error;
    }
  }

  async findBookingByScheduleId(scheduleId: string): Promise<IBookingData> {
    try {
      const schedule = await this.schedulesService.readOne(scheduleId);
      const payment = await this.paymentService.findByScheduleId(scheduleId);
      const session = await this.sessionService.findByScheduleId(scheduleId);
      const sessionData = session
        ? session
        : 'Pagamento não realizado, portanto a sessão não foi marcada ainda';
      const booking = {
        scheduleData: schedule,
        paymentData: payment,
        sessionData,
      };
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async updateBooking(
    scheduleId: string,
    { scheduleData }: IBookingData,
  ): Promise<IBookingData> {
    try {
      const {
        scheduleData: existingSchedule,
        paymentData: existingPayment,
        sessionData: existingsession,
      } = await this.findBookingByScheduleId(scheduleId);

      if (!existingSchedule) {
        throw new Error('Existing schedule not found');
      }

      const updatedSchedule = await this.schedulesService.update(
        existingSchedule._id,
        scheduleData,
      );

      const user_id = updatedSchedule.user_id.toString();
      const id = existingPayment._id.toString();

      existingPayment.status =
        existingSchedule.status === 'concluído'
          ? 'pago'
          : existingSchedule.status;

      const updatedPayment = await this.paymentService.update(
        id,
        existingPayment,
        user_id,
      );
      const updatedBooking: IBookingData = {
        scheduleData: updatedSchedule,
        paymentData: updatedPayment,
        sessionData:
          'Pagamento não realizado, portanto a sessão não foi marcada ainda',
      };

      if (updatedPayment.status === 'pago') {
        const startDate = new Date(scheduleData.start_date);
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const year = startDate.getFullYear();
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');

        const sessionBody = {
          schedule_id: scheduleId,
          date: `A sessão com este usuário está marcada para a data ${day}/${month}/${year} às ${hours}:${minutes}`,
          price: updatedPayment.price,
        };

        // Check if a session already exists
        if (existingsession && typeof existingsession !== 'string') {
          // Update the existing session
          await this.sessionService.update(existingsession._id, sessionBody);
          updatedBooking.sessionData = sessionBody;
        } else {
          // Create a new session if one doesn't exist
          const session = await this.sessionService.create(sessionBody);
          updatedBooking.sessionData = session;
        }
      }

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  }

  async findBookingsByUser(userId: string): Promise<IBookingData[]> {
    try {
      const schedules = await this.schedulesService.findByUserId(userId);
      const bookings = await Promise.all(
        schedules.map(async (schedule) => {
          const payment = await this.paymentService.findByScheduleId(
            schedule._id,
          );
          const session = await this.sessionService.findByScheduleId(
            schedule._id,
          );
          const sessionData = session
            ? session
            : 'Pagamento não realizado, portanto a sessão não foi marcada ainda';

          return {
            scheduleData: schedule,
            paymentData: payment,
            sessionData,
          };
        }),
      );
      return bookings;
    } catch (error) {
      throw error;
    }
  }
}

export default BookingService;
