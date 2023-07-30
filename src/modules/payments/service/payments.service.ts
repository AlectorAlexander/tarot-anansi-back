import { IService } from 'src/modules/interfaces/IService';
import { SafeParseError } from 'zod';
import { IPayments, paymentsValidationSchema } from '../dtos/payments.dtos';
import PaymentsModel from '../entities/payments.entity';

class PaymentService implements IService<IPayments> {
  private _payments: PaymentsModel;

  constructor() {
    this._payments = new PaymentsModel();
  }

  private sortByDateCreation(a: IPayments, b: IPayments): number {
    const dateA = a.date_creation || new Date(0);
    const dateB = b.date_creation || new Date(0);
    return dateA.getTime() - dateB.getTime();
  }

  private async validateDataAndCreate(data: IPayments): Promise<IPayments> {
    const parsed = paymentsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IPayments>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const payment = await this._payments.create(data);
    return payment;
  }

  public async create(data: IPayments): Promise<IPayments> {
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<IPayments> {
    try {
      return await this._payments.delete(id);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<IPayments[]> {
    try {
      const paymentsFromDB = await this._payments.read();
      const payments = paymentsFromDB.map((payment) => ({
        ...payment,
      }));

      payments.sort(this.sortByDateCreation);

      return payments;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<IPayments> {
    try {
      const payment = await this._payments.readOne(id);
      return payment;
    } catch (error) {
      throw error;
    }
  }

  public async findByScheduleId(scheduleId: string): Promise<IPayments[]> {
    try {
      const paymentsFromDB = await this._payments.read({
        schedule_id: scheduleId,
      });
      const payments = paymentsFromDB.map((payment) => ({
        ...payment,
      }));

      payments.sort(this.sortByDateCreation);

      return payments;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, data: IPayments): Promise<IPayments> {
    const parsed = paymentsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IPayments>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedPayment = await this._payments.update(id, data);
      return updatedPayment;
    } catch (error) {
      throw error;
    }
  }
}

export default PaymentService;
