import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { EventData, Event } from './event.interfaces';

@Injectable()
export default class GoogleCalendarService {
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

  async getEventById(eventId: string): Promise<Event> {
    try {
      const event = await this.calendar.events.get({
        calendarId: process.env.CALENDAR_ID,
        eventId: eventId,
      });

      return event.data as Event;
    } catch (error) {
      if (error.message.includes('invalid_grant')) {
        console.warn(`Google Calendar access issue: ${error.message}`);
        return;
      }
      throw new Error(`Failed to get event by ID: ${error.message}`);
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
      if (error.message.includes('invalid_grant')) {
        console.warn(`Google Calendar access issue: ${error.message}`);
        return []; // Retorna um array vazio para permitir a continuação
      }
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
      console.log(error.message);
      if (error.message.includes('invalid_grant')) {
        console.warn(`Google Calendar access issue: ${error.message}`);
        return eventData as Event;
      }
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
