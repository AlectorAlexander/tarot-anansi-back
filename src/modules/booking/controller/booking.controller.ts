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
      const userId = req.user.id;
      data.scheduleData.user_id = userId;
      data.scheduleData.start_date = new Date(data.scheduleData.start_date);
      data.scheduleData.end_date = new Date(data.scheduleData.end_date);
      const booking = await this.bookingService.createBooking(data);
      return booking;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create booking',
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
