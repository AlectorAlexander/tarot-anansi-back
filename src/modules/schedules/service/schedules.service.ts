/* eslint-disable prettier/prettier */
import { SafeParseError } from 'zod';
import SchedulesModel from '../entities/schedules.entity';
import {
  ISchedules,
  schedulesValidationSchema,
} from './../dtos/schedules.dtos';
import { IService } from '../../interfaces/IService';
import NotificationService from '../../notifications/service/notifications.service';
import GoogleCalendarService from '../../booking/google-calendar/google-calendar.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
class SchedulesService implements IService<ISchedules> {
  private _schedule: SchedulesModel;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {
    this._schedule = new SchedulesModel();
  }

  private async createAndSendNotification(data: ISchedules, action: 'created' | 'updated' | 'cancelled'): Promise<void> {
    const { user_id, start_date, status } = data;
    const start_date_formatted = new Date(start_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  
    const start_time_formatted = new Date(start_date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  
    let message = '';
    if (action === 'created') {
      message = `Seu agendamento foi marcado para o dia ${start_date_formatted} às ${start_time_formatted}.`;
    } else if (action === 'cancelled') {
      message = `Seu agendamento para o dia ${start_date_formatted} às ${start_time_formatted} foi cancelado.`;
    } else if (action === 'updated') {
      message = `Sua sessão foi reagendada para o dia ${start_date_formatted} às ${start_time_formatted}.`;
    }
  
    if (message !== '') {
      await this.notificationService.create({
        user_id,
        message,
      });
    }
  }
  

  private async validateDataAndCreate(data: ISchedules): Promise<ISchedules> {
    const parsed = schedulesValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<ISchedules>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const schedule = await this._schedule.create(data);
    await this.createAndSendNotification(schedule, 'created');
    return schedule;
  }

  public async create(data: ISchedules): Promise<ISchedules> {
    try {
      if (data.start_date > data.end_date) {
        throw new BadRequestException({
          message: 'Start date must be before end date',
        });
      }
      if (data.start_date.getDay() === 6 || data.start_date.getDay() === 0) {
        throw new BadRequestException({
          message: 'Start date must be a weekday',
        });
      }
      const schedulesSearch = await this.findByDate(
        data.start_date,
        data.end_date,
      );
      if (schedulesSearch.length > 0) {
        throw new BadRequestException({
          message: 'Schedules already exist for this date',
        });
      }
      const filter = {
        status: 'pendente',
        user_id: data.user_id,
      };
      const schedulesPendent = await this._schedule.read(filter);
      if (schedulesPendent && schedulesPendent.length > 0) {
        throw new BadRequestException({
          message: 'There are pending schedules',
        });
      }
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<ISchedules[]> {
    const schedules = await this._schedule.read();
    const today = new Date();
    const thisYear = today.getFullYear();
    const lastDateOfTheYear = new Date(thisYear, 11, 31);
    const schedulesFromGoogle = await this.googleCalendarService.listEvents(
      today,
      lastDateOfTheYear,
    );

    if (!schedulesFromGoogle || schedulesFromGoogle.length === 0) {
      return schedules;
    }

    // Mapear os eventos do Google para o formato ISchedules
    const schedulesFromGoogleFormatted: ISchedules[] = schedulesFromGoogle.map(
      (event) => {
        const { start, end, id } = event;
        const startDate = new Date(start.dateTime);
        const endDate = new Date(end.dateTime);
        const google_event_id = id;
        return {
          _id: '',
          user_id: '', 
          start_date: startDate,
          end_date: endDate,
          google_event_id,
          status: 'agendado', 
          date_creation: new Date(), 
          date_update: new Date(), 
        };
      },
    );

    return [...schedules, ...schedulesFromGoogleFormatted];
  }

  public async readOne(id: string): Promise<ISchedules | null> {
    // Implementando o método readOne exigido pela interface
    try {
      const schedule = await this._schedule.readOne(id);
      return schedule || null;
    } catch (error) {
      throw error;
    }
  }

  public async findByUserId(userId: string): Promise<ISchedules[]> {
    try {
      const schedules = await this._schedule.read({ user_id: userId });
      return schedules.map((schedule) => schedule);
    } catch (error) {
      throw error;
    }
  }

  public async findByDate(
    start_date: Date,
    end_date?: Date,
  ): Promise<ISchedules[]> {
    try {
      if (end_date) {
        const schedules = await this._schedule.read({
          start_date: { $gte: start_date },
          end_date: { $lte: end_date },
        });
        const schedulesFromGoogle = await this.googleCalendarService.listEvents(
          start_date,
          end_date,
        );
        if (schedulesFromGoogle && schedulesFromGoogle.length > 0) {

          const schedulesFromGoogleFormatted: ISchedules[] =
          schedulesFromGoogle.map((event) => {
            const { start, end, id } = event;
            const startDate = new Date(start.dateTime);
            const endDate = new Date(end.dateTime);
            const google_event_id = id;
            return {
              _id: '', // Preencher com o ID se necessário
              user_id: '', // Preencher com o ID do usuário se necessário
              start_date: startDate,
              end_date: endDate,
              google_event_id,
              status: 'agendado', // Definir o status conforme necessário
              date_creation: new Date(), // Preencher com a data de criação se necessário
              date_update: new Date(), // Preencher com a data de atualização se necessário
            };
          });



          if (!schedules.length && !schedulesFromGoogleFormatted.length) {
            return [];
          }

          return [...schedules, ...schedulesFromGoogleFormatted];
        } else {
          return schedules;
        }

      } else {
        const startOfDay = new Date(start_date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(start_date);
        endOfDay.setHours(23, 59, 59, 999);

        const schedules = await this._schedule.read({
          start_date: { $gte: startOfDay, $lte: endOfDay },
        });
        const schedulesFromGoogle = await this.googleCalendarService.listEvents(
          startOfDay,
          endOfDay,
        );

        if (schedulesFromGoogle) {


          const schedulesFromGoogleFormatted: ISchedules[] =
          schedulesFromGoogle.map((event) => {
            const { start, end, id } = event;
            const startDate = new Date(start.dateTime);
            const endDate = new Date(end.dateTime);
            const google_event_id = id;
            return {
              _id: '', // Preencher com o ID se necessário
              user_id: '', // Preencher com o ID do usuário se necessário
              start_date: startDate,
              end_date: endDate,
              google_event_id,
              status: 'agendado', // Definir o status conforme necessário
              date_creation: new Date(), // Preencher com a data de criação se necessário
              date_update: new Date(), // Preencher com a data de atualização se necessário
            };
          });

          if (!schedules.length && !schedulesFromGoogleFormatted.length) {
            return [];
          }

          return [...schedules, ...schedulesFromGoogleFormatted];
        } else {
          return schedules;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  public async update(
    id: string,
    data: ISchedules,
  ): Promise<ISchedules | null> {
    try {
      const existingSchedule = await this._schedule.readOne(id);
      if (!existingSchedule)
        throw new BadRequestException('Schedule not found');


      console.log({el1: data.start_date, el2: existingSchedule.start_date});
      
      
      const isStartDateChanged = !data.start_date || existingSchedule.start_date.toString() !== data.start_date.toString();
      const isEndDateChanged = !data.end_date || existingSchedule.end_date.toString() !== data.end_date.toString();
      const isDateChanged = isStartDateChanged || isEndDateChanged;

      // Atualiza o agendamento local
      const updatedSchedule = await this._schedule.update(id, data);

      // Atualiza o evento no Google Calendar, se existir
      if (existingSchedule.google_event_id) {
        const googleEvent = await this.googleCalendarService.getEventById(
          existingSchedule.google_event_id,
        );
        if (!googleEvent) {
          if (isDateChanged) {
            await this.createAndSendNotification(updatedSchedule, 'updated');
          }
          return updatedSchedule;
        }
        
        const startDateTime = updatedSchedule.start_date.toISOString();
        const endDateTime = updatedSchedule.end_date.toISOString();
        await this.googleCalendarService.updateEvent(
          existingSchedule.google_event_id,
          {
            summary: googleEvent.summary,
            description: googleEvent.description,
            location: googleEvent.location,
            start: {
              dateTime: startDateTime,
              timeZone: googleEvent.start.timeZone,
            },
            end: {
              dateTime: endDateTime,
              timeZone: googleEvent.end.timeZone,
            },
            attendees: googleEvent.attendees,
            reminders: googleEvent.reminders,
          },
        );
      }

      // Chama createAndSendNotification somente se houve alteração na data
      if (isDateChanged) {
        await this.createAndSendNotification(updatedSchedule, 'updated');
      }

      return updatedSchedule;
    } catch (error) {
      throw error;
    }
  }


  public async delete(id: string): Promise<ISchedules | null> {
    try {
      const existingSchedule = await this._schedule.readOne(id);
      if (!existingSchedule)
        throw new BadRequestException('Schedule not found');

      if (existingSchedule.google_event_id) {
        this.googleCalendarService.deleteEvent(
          existingSchedule.google_event_id,
        );
      }
      const deletedSchedule = await this._schedule.delete(id);
      return deletedSchedule || null;
    } catch (error) {
      throw error;
    }
  }

  public async filterAvailableSlots(
    dateInput: string | Date, // pode aceitar ambos os tipos
    slots: string[],
  ): Promise<string[]> {
    // Garanta que a data seja um objeto Date
    const date = new Date(dateInput);

    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    );

    // Encontre os agendamentos existentes para o dia
    const existingAppointments = await this.findByDate(dayStart, dayEnd);

    // Filtre os slots que não se sobrepõem a nenhum agendamento existente
    const availableSlots = slots.filter((slot) => {
      const [startTime, endTime] = slot.split(' - ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const slotStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startHour,
        startMinute,
      );
      const slotEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endHour,
        endMinute,
      );

      // Verifique se o slot está disponível
      return !existingAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.start_date);
        const appointmentEnd = new Date(appointment.end_date);

        // Se o slot começa durante outro agendamento ou se um agendamento começa durante o slot
        return (
          (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
          (appointmentStart >= slotStart && appointmentStart < slotEnd)
        );
      });
    });

    return availableSlots;
  }
}

export default SchedulesService;
