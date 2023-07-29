import { SafeParseError } from 'zod';
import SchedulesModel from '../entities/schedules.entity';
import {
  ISchedules,
  schedulesValidationSchema,
} from './../dtos/schedules.dtos';
import { IService } from '../../interfaces/IService';

class SchedulesService implements IService<ISchedules> {
  private _schedule: SchedulesModel;

  constructor() {
    this._schedule = new SchedulesModel();
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
    return schedule;
  }

  public async create(data: ISchedules): Promise<ISchedules> {
    try {
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
      const parsed = schedulesValidationSchema.safeParse(data);
      const updatedSchedule = await this._schedule.update(id, data);
      return updatedSchedule || null;
    } catch (error) {
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
