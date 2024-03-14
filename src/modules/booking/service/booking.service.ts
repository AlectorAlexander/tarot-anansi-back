import { Injectable } from '@nestjs/common';
import { ISchedules } from '../..//schedules/dtos/schedules.dtos';
import PaymentService from '../../payments/service/payments.service';
import SchedulesService from '../../schedules/service/schedules.service';
import { IPayments } from '../../payments/dtos/payments.dtos';
import SessionsService from '../../sessions/service/sessions.service';
import { ISessions } from '../../sessions/dtos/sessions.dtos';
import GoogleCalendarService from '../google-calendar/google-calendar.service';
import { EventData } from '../google-calendar/event.interfaces';
import { IUser } from 'src/modules/users/dtos/users.dtos';
import UsersService from 'src/modules/users/service/users.service';

export type IBookingData = {
  scheduleData: ISchedules;
  paymentData: IPayments;
  sessionData: ISessions | string;
  sessionName?: string;
  userData?: IUser;
};

@Injectable()
class BookingService {
  constructor(
    private schedulesService: SchedulesService,
    private paymentService: PaymentService,
    private sessionService: SessionsService,
    private googleCalendarService: GoogleCalendarService,
    private userService: UsersService,
  ) {}

  async deleteBooking(
    paymentId: string,
    sessionId: string,
    scheduleId: string,
  ): Promise<IBookingData | null> {
    try {
      const payment = await this.paymentService.delete(paymentId);
      if (!payment) {
        throw new Error('Failed to delete payment');
      }

      const session = await this.sessionService.delete(sessionId);
      if (!session) {
        throw new Error('Failed to delete session');
      }

      const schedule = await this.schedulesService.delete(scheduleId);
      if (!schedule) {
        throw new Error('Failed to delete schedule');
      }

      return {
        scheduleData: schedule,
        paymentData: payment,
        sessionData: session,
      };
    } catch (error) {
      console.error('Error deleting booking:', error.message);
      throw new Error('Failed to delete booking');
    }
  }

  async createBooking(data: IBookingData): Promise<IBookingData> {
    try {
      const { scheduleData, paymentData } = data;
      const schedule = await this.schedulesService.create(scheduleData);
      const schedule_id = schedule._id.toString();
      const user_id = schedule.user_id.toString();

      const userData = await this.userService.findById(user_id);

      const { name, email, phone } = userData;

      const stats = schedule.status === 'pendente' ? 'pendente' : 'cancelado';

      const stats2 = schedule.status === 'reembolsado' ? 'reembolsado' : stats;

      const paymentBody: IPayments = {
        schedule_id,
        price: paymentData.price,
        status: schedule.status === 'agendado' || 'concluído' ? 'pago' : stats2,
      };

      const payment = await this.paymentService.create(paymentBody, user_id);
      const booking: IBookingData = {
        scheduleData: schedule,
        userData,
        paymentData: payment,
        sessionData:
          'Pagamento não realizado, portanto a sessão não foi marcada ainda',
      };
      if (payment.status === 'pago') {
        const startDate = new Date(scheduleData.start_date);
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const year = startDate.getFullYear();
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');

        const sessionBody = {
          schedule_id: schedule_id,
          date: `Nova sessão de ${data.sessionName} agendada para a data ${day}/${month}/${year} às ${hours}:${minutes} com o cliente ${name}. Email: ${email}. Telefone: ${phone}`,
          price: paymentData.price,
        };
        const session = await this.sessionService.create(sessionBody);
        console.log({ session });

        booking.sessionData = session;
        const eventData: EventData = {
          summary: `Sessão de ${data.sessionName}`,
          description: `Sessão de ${data.sessionName} agendada para a data ${day}/${month}/${year} às ${hours}:${minutes} - Cliente: ${name} - Telefone: ${phone}`,
          location: 'Online',
          start: {
            dateTime: `${year}-${month}-${day}T${hours}:${minutes}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: `${year}-${month}-${day}T${hours}:${minutes}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          attendees: [email],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
              { method: 'popup', minutes: 30 },
            ],
          },
        };
        const event = await this.googleCalendarService.createEvent(eventData);
        await this.schedulesService.update(schedule._id, {
          google_event_id: event.id,
        });
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
      const user_id = schedule.user_id.toString();
      const userData = await this.userService.findById(user_id);
      const sessionData = session
        ? session
        : 'Pagamento não realizado, portanto a sessão não foi marcada ainda';
      const booking = {
        scheduleData: schedule,
        paymentData: payment,
        sessionData,
        userData,
      };
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async updateBooking(
    scheduleId: string,
    { scheduleData, sessionName }: IBookingData,
  ): Promise<IBookingData> {
    try {
      const {
        scheduleData: existingSchedule,
        paymentData: existingPayment,
        sessionData: existingsession,
        userData: existingUser,
      } = await this.findBookingByScheduleId(scheduleId);

      const { name, email, phone } = existingUser;

      if (!existingSchedule) {
        throw new Error('Existing schedule not found');
      }

      const updatedSchedule = await this.schedulesService.update(
        existingSchedule._id,
        scheduleData,
      );

      const user_id = updatedSchedule.user_id.toString();
      const id = existingPayment._id.toString();

      const stats =
        existingSchedule.status === 'pendente' ? 'pendente' : 'cancelado';

      const stats2 =
        existingSchedule.status === 'reembolsado' ? 'reembolsado' : stats;

      existingPayment.status =
        existingSchedule.status === 'agendado' || 'concluído' ? 'pago' : stats2;

      const updatedPayment = await this.paymentService.update(
        id,
        existingPayment,
        user_id,
      );
      const updatedBooking: IBookingData = {
        scheduleData: updatedSchedule,
        userData: await this.userService.findById(user_id),
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
          date: `Nova sessão de ${sessionName} reagendada para a data ${day}/${month}/${year} às ${hours}:${minutes} com o cliente ${name}. Email: ${email}. Telefone: ${phone}`,
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
            userData: await this.userService.findById(
              schedule.user_id.toString(),
            ), // Adding userData here
          };
        }),
      );
      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async findAllBookingsForAdmin(): Promise<IBookingData[]> {
    try {
      const schedules = await this.schedulesService.read();
      const bookings: IBookingData[] = [];

      for (const schedule of schedules) {
        // Verifica se schedule.user_id é válido
        if (!schedule.user_id || schedule.user_id === '') {
          continue;
        }

        try {
          const user = await this.userService.findById(
            schedule.user_id.toString(),
          );

          if (user) {
            const payment = await this.paymentService.findByScheduleId(
              schedule._id.toString(),
            );
            const session = await this.sessionService.findByScheduleId(
              schedule._id.toString(),
            );

            const sessionData = session
              ? session
              : 'Sessão ainda não definida ou pagamento pendente';

            const bookingData: IBookingData = {
              scheduleData: schedule,
              paymentData: payment,
              sessionData: sessionData,
              userData: user,
            };

            bookings.push(bookingData);
          }
        } catch (error) {
          console.error(error);
          continue;
        }
      }
      return bookings;
    } catch (error) {
      throw error;
    }
  }
}

export default BookingService;
