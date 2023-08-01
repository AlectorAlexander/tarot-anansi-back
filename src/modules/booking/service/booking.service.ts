import { ISchedules } from '../..//schedules/dtos/schedules.dtos';
import PaymentService from '../../payments/service/payments.service';
import SchedulesService from '../../schedules/service/schedules.service';
import { IPayments } from 'src/modules/payments/dtos/payments.dtos';

type IBookingData = {
  scheduleData: ISchedules;
  paymentData: IPayments;
};

class BookingService {
  constructor(
    private schedulesService: SchedulesService,
    private paymentService: PaymentService,
  ) {}

  async createBooking(data: IBookingData): Promise<IBookingData> {
    try {
      const { scheduleData, paymentData } = data;
      const schedule = await this.schedulesService.create(scheduleData);

      const paymentBody: IPayments = {
        schedule_id: schedule._id,
        price: paymentData.price,
        status: schedule.status === 'concluído' ? 'pago' : schedule.status,
      };
      const payment = await this.paymentService.create(paymentBody);
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
    bookingId: string,
    data: IBookingData,
  ): Promise<IBookingData> {
    try {
      const existingBooking = await this.findBookingByScheduleId(bookingId);
      const updatedSchedule = await this.schedulesService.update(
        existingBooking.scheduleData._id,
        data.scheduleData,
      );
      const updatedPayment = await this.paymentService.update(
        existingBooking.paymentData._id,
        data.paymentData,
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
