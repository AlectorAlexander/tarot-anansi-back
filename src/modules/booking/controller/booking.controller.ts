import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import BookingService, { IBookingData } from '../service/booking.service';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() data: IBookingData,
  ): Promise<IBookingData> {
    try {
      if (!data.scheduleData || !data.paymentData) {
        throw new BadRequestException({
          message: 'Missing scheduleData or paymentData',
          details: 'read the message, fool',
        });
      }

      const userId = req.user.id;

      data.scheduleData.user_id = userId;
      data.scheduleData.start_date = new Date(data.scheduleData.start_date);
      data.scheduleData.end_date = new Date(data.scheduleData.end_date);

      const booking = await this.bookingService.createBooking(data);

      if (!booking) {
        throw new BadRequestException({
          message: 'Failed to create booking',
          details: 'Booking creation returned null',
        });
      }
      console.log({ booking });

      return booking;
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: error.message || 'Failed to create booking',
        details: error.message,
      });
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllBookings() {
    try {
      const bookings = await this.bookingService.findAllBookingsForAdmin();
      return bookings;
    } catch (error) {
      console.log({ Booking_GetAll_70: error.message });
      throw new NotFoundException({
        message: 'Failed to find bookings',
        details: error.message,
      });
    }
  }

  @Post('Delete')
  @UseGuards(JwtAuthGuard)
  async deleteBooking(
    @Body() data: { paymentId: string; sessionId: string; scheduleId: string },
  ) {
    try {
      const { paymentId, sessionId, scheduleId } = data;
      const deletedBooking = await this.bookingService.deleteBooking(
        paymentId,
        sessionId,
        scheduleId,
      );

      return deletedBooking;
    } catch (error) {
      console.error('Error deleting booking:', error.message);
      throw new BadRequestException({
        message: error.message || 'Failed to delete booking',
        details: error.message,
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findBookingByUserId(@Request() req: any) {
    try {
      const userId = req.user.id;
      const booking = await this.bookingService.findBookingsByUser(userId);
      if (!booking)
        throw new NotFoundException({
          message: 'Failed to find booking',
        });
      return booking;
    } catch (error) {
      throw new NotFoundException({
        message: 'Failed to find booking',
        details: error.message,
      });
    }
  }

  @Put(':scheduleId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('scheduleId') scheduleId: string,
    @Body() data: IBookingData,
  ): Promise<IBookingData> {
    try {
      const updatedBooking = await this.bookingService.updateBooking(
        scheduleId,
        data,
      );
      return updatedBooking;
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: 'Failed to update booking',
        details: error.message,
      });
    }
  }

  @Get(':scheduleId')
  @UseGuards(JwtAuthGuard)
  async findBookingByScheduleId(@Param('scheduleId') scheduleId: string) {
    try {
      const booking = await this.bookingService.findBookingByScheduleId(
        scheduleId,
      );
      if (!booking)
        throw new NotFoundException({
          message: 'Failed to find booking',
        });
      return booking;
    } catch (error) {
      throw new NotFoundException({
        message: 'Failed to find booking',
        details: error.message,
      });
    }
  }
}
