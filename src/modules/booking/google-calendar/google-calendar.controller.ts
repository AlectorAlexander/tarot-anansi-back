import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import GoogleCalendarService from './google-calendar.service';
import { EventData, Event } from './event.interfaces';

@Controller('calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Post('event')
  async createEvent(@Body() eventData: EventData): Promise<Event> {
    try {
      const event = await this.googleCalendarService.createEvent(eventData);
      return event;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create event',
        details: error.message,
      });
    }
  }

  @Get('events/:timeMin/:timeMax')
  async listEvents(
    @Param('timeMin') timeMin: string,
    @Param('timeMax') timeMax: string,
  ): Promise<Event[]> {
    try {
      const parsedTimeMin = new Date(timeMin);
      const parsedTimeMax = new Date(timeMax);
      const events = await this.googleCalendarService.listEvents(
        parsedTimeMin,
        parsedTimeMax,
      );
      return events;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to list events',
        details: error.message,
      });
    }
  }

  @Put('event/:id')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() eventData: EventData,
  ): Promise<Event> {
    try {
      const event = await this.googleCalendarService.updateEvent(
        eventId,
        eventData,
      );
      return event;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update event',
        details: error.message,
      });
    }
  }

  @Delete('event/:id')
  async deleteEvent(@Param('id') eventId: string): Promise<void> {
    try {
      await this.googleCalendarService.deleteEvent(eventId);
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete event',
        details: error.message,
      });
    }
  }
}
