import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import PaymentService from '../service/payments.service';
import { IPayments } from '../dtos/payments.dtos';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  /* async read(@Request() req: any): Promise<IPayments[]> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const payment = await this.paymentService.read();
        return payment;
      } else {
        const userId = req.user.id;
        const payment = await this.paymentService.findByScheduleId(userId);
        return payment;
      }
    } catch (error) {
      throw new NotFoundException('No payment found');
    }
  } */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async readOne(@Param('id') id: string): Promise<IPayments> {
    try {
      const notification = await this.paymentService.readOne(id);
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
      return notification;
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() notificationUpdates: IPayments,
  ): Promise<IPayments> {
    try {
      const updatedNotification = await this.paymentService.update(
        id,
        notificationUpdates,
      );
      if (!updatedNotification) {
        throw new NotFoundException('Notification not found');
      }
      return updatedNotification;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update notification',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<IPayments> {
    try {
      const deletedNotification = await this.paymentService.delete(id);
      if (!deletedNotification) {
        throw new NotFoundException('Notification not found');
      }
      return deletedNotification;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete notification',
        details: error.message,
      });
    }
  }
}
