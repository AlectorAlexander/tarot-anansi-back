import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { EventData, Event } from './event.interfaces';

@Injectable()
export class GoogleCalendarService {
  private calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(eventData: EventData): Promise<Event> {
    try {
      const event = await this.calendar.events.insert({
        calendarId: process.env.CALENDAR_ID,
        requestBody: eventData,
      });

      return event.data as Event;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async listEvents(timeMin: Date, timeMax: Date): Promise<Event[]> {
    try {
      const events = await this.calendar.events.list({
        calendarId: process.env.CALENDAR_ID,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return events.data.items as Event[];
    } catch (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }
  }

  async updateEvent(eventId: string, eventData: EventData): Promise<Event> {
    try {
      const event = await this.calendar.events.patch({
        calendarId: process.env.CALENDAR_ID,
        eventId: eventId,
        requestBody: eventData,
      });

      return event.data as Event;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: process.env.CALENDAR_ID,
        eventId: eventId,
      });
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }
}