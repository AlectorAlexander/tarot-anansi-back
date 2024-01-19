import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { INotifications } from '../dtos/notifications.dtos';
import NotificationService from '../service/notifications.service';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() data: INotifications,
  ): Promise<INotifications> {
    try {
      const userId = req.user.id;
      data.user_id = userId;
      if (data.notification_date) {
        data.notification_date = new Date(data.notification_date);
      }
      const notification = await this.notificationService.create(data);
      return notification;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create notification',
        details: error.message,
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async read(@Request() req: any): Promise<INotifications[]> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const notifications = await this.notificationService.read();
        return notifications;
      } else {
        const userId = req.user.id;
        const notifications = await this.notificationService.findByUserId(
          userId,
        );
        return notifications;
      }
    } catch (error) {
      throw new NotFoundException('No notifications found');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async readOne(@Param('id') id: string): Promise<INotifications> {
    try {
      const notification = await this.notificationService.readOne(id);
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
    @Body() notificationUpdates: INotifications,
  ): Promise<INotifications> {
    console.log(id);
    try {
      const updatedNotification = await this.notificationService.update(
        id,
        notificationUpdates,
      );
      if (!updatedNotification) {
        throw new NotFoundException('Notification not found');
      }
      return updatedNotification;
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        message: 'Failed to update notification',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<INotifications> {
    try {
      const deletedNotification = await this.notificationService.delete(id);
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
