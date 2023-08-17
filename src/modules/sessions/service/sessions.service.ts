import { IService } from 'src/modules/interfaces/IService';
import { SafeParseError } from 'zod';
import { Injectable } from '@nestjs/common';
import { ISessions, sessionsValidationSchema } from '../dtos/sessions.dtos';
import SessionsModel from '../entities/sessions.entity';

@Injectable()
class SessionsService implements IService<ISessions> {
  private _sessions: SessionsModel;

  constructor() {
    this._sessions = new SessionsModel();
  }

  private sortByDateCreation(a: ISessions, b: ISessions): number {
    const dateA = a.date_creation || new Date(0);
    const dateB = b.date_creation || new Date(0);
    return dateA.getTime() - dateB.getTime();
  }

  private async validateDataAndCreate(data: ISessions): Promise<ISessions> {
    const parsed = sessionsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<ISessions>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const session = await this._sessions.create(data);
    return session;
  }

  public async create(data: ISessions): Promise<ISessions> {
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<ISessions> {
    try {
      return await this._sessions.delete(id);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<ISessions[]> {
    try {
      const sessionsFromDB = await this._sessions.read();
      const sessions = sessionsFromDB.map((session) => ({
        ...session,
      }));

      sessions.sort(this.sortByDateCreation);

      return sessions;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<ISessions> {
    try {
      const session = await this._sessions.readOne(id);
      return session;
    } catch (error) {
      throw error;
    }
  }

  public async findByScheduleId(scheduleId: string): Promise<ISessions> {
    try {
      const payment = await this._sessions.read({
        schedule_id: scheduleId,
      });

      return payment[0];
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, data: ISessions): Promise<ISessions> {
    const parsed = sessionsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<ISessions>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedsessions = await this._sessions.update(id, data);
      return updatedsessions;
    } catch (error) {
      throw error;
    }
  }
}

export default SessionsService;
