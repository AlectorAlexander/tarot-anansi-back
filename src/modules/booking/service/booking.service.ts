import { Injectable } from '@nestjs/common';
import { ISchedules } from '../..//schedules/dtos/schedules.dtos';
import PaymentService from '../../payments/service/payments.service';
import SchedulesService from '../../schedules/service/schedules.service';
import { IPayments } from 'src/modules/payments/dtos/payments.dtos';

export type IBookingData = {
  scheduleData: ISchedules;
  paymentData: IPayments;
};

@Injectable()
class BookingService {
  constructor(
    private schedulesService: SchedulesService,
    private paymentService: PaymentService,
  ) {}

  async createBooking(data: IBookingData): Promise<IBookingData> {
    try {
      const { scheduleData, paymentData } = data;
      const schedule = await this.schedulesService.create(scheduleData);
      const schedule_id = schedule._id.toString();
      const user_id = schedule.user_id.toString();

      const paymentBody: IPayments = {
        schedule_id,
        price: paymentData.price,
        status: schedule.status === 'concluído' ? 'pago' : schedule.status,
      };
      const payment = await this.paymentService.create(paymentBody, user_id);
      const booking = {
        scheduleData: schedule,
        paymentData: payment,
      };
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async findBookingByScheduleId(scheduleId: string): Promise<IBookingData> {
    try {
      const schedule = await this.schedulesService.readOne(scheduleId);
      const payment = await this.paymentService.findByScheduleId(scheduleId);
      const booking = {
        scheduleData: schedule,
        paymentData: payment,
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
      const { scheduleData: existingSchedule, paymentData: existingPayment } =
        await this.findBookingByScheduleId(scheduleId);
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

      return {
        scheduleData: updatedSchedule,
        paymentData: updatedPayment,
      };
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
          return {
            scheduleData: schedule,
            paymentData: payment,
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
