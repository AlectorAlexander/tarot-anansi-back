import { SafeParseError } from 'zod';
import SchedulesModel from '../entities/schedules.entity';
import {
  ISchedules,
  schedulesValidationSchema,
} from './../dtos/schedules.dtos';
import { IService } from '../../interfaces/IService';
import NotificationService from 'src/modules/notifications/service/notifications.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
class SchedulesService implements IService<ISchedules> {
  private _schedule: SchedulesModel;

  constructor(private readonly notificationService: NotificationService) {
    this._schedule = new SchedulesModel();
  }

  private async createAndSendNotification(data: ISchedules): Promise<void> {
    const { user_id, start_date, status } = data;
    const start_date_formatted = new Date(start_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );

    const start_time_formatted = new Date(start_date).toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    let message = '';
    if (status === 'pago') {
      message = `Seu agendamento foi marcado para o dia ${start_date_formatted} às ${start_time_formatted}`;
    } else if (status === 'cancelado') {
      message = `Seu agendamento para o dia ${start_date_formatted} às ${start_time_formatted} foi cancelado`;
    } else if (status === 'pendente') {
      message = `O pagamento de sua seção para o dia ${start_date_formatted} às ${start_time_formatted}, ainda consta como pendente. Portanto, o agendamento ainda não está confirmado`;
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
    await this.createAndSendNotification(schedule);
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
    return schedules.map((schedule) => schedule);
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
        if (!schedules) return [];
        return schedules.map((schedule) => schedule);
      } else {
        const startOfDay = new Date(start_date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(start_date);
        endOfDay.setHours(23, 59, 59, 999);

        const schedules = await this._schedule.read({
          start_date: { $gte: startOfDay, $lte: endOfDay },
        });
        return schedules.map((schedule) => schedule);
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
      schedulesValidationSchema.safeParse(data);
      const updatedSchedule = await this._schedule.update(id, data);
      if (updatedSchedule) {
        await this.createAndSendNotification(updatedSchedule);
      }
      return updatedSchedule || null;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  public async delete(id: string): Promise<ISchedules | null> {
    try {
      const deletedSchedule = await this._schedule.delete(id);
      return deletedSchedule || null;
    } catch (error) {
      throw error;
    }
  }
}

export default SchedulesService;
