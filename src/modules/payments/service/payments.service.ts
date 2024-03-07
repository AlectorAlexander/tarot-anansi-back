import { IService } from '../../interfaces/IService';
import { SafeParseError } from 'zod';
import { IPayments, paymentsValidationSchema } from '../dtos/payments.dtos';
import PaymentsModel from '../entities/payments.entity';
import NotificationService from '../../notifications/service/notifications.service';
import { Injectable } from '@nestjs/common';

@Injectable()
class PaymentService implements IService<IPayments> {
  private _payments: PaymentsModel;

  constructor(private readonly notificationService: NotificationService) {
    this._payments = new PaymentsModel();
  }

  private async createAndSendNotification(
    data: IPayments,
    user_id: string,
  ): Promise<void> {
    const { status, price } = data;
    let message = '';
    if (status === 'pago') {
      message = `Seu pagamento de R$${price} foi efetuado com sucesso`;
    } else if (status === 'cancelado') {
      message = `Seu pagamento foi cancelado`;
    } else if (status === 'pendente') {
      message = `Seu pagamento ainda não foi confirmado`;
    }

    if (message !== '') {
      await this.notificationService.create({
        message,
        user_id,
      });
    }
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

  public async create(data: IPayments, user_id?: string): Promise<IPayments> {
    try {
      const payment = await this.validateDataAndCreate(data);
      if (user_id) {
        await this.createAndSendNotification(payment, user_id);
      }
      return payment;
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
      const payments = paymentsFromDB.map((payment) => payment.toObject());

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

  public async findByScheduleId(scheduleId: string): Promise<IPayments> {
    try {
      const payment = await this._payments.read({
        schedule_id: scheduleId,
      });

      return payment[0];
    } catch (error) {
      throw error;
    }
  }

  public async update(
    _id: string,
    data: IPayments,
    user_id?: string,
  ): Promise<IPayments> {
    const parsed = paymentsValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IPayments>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedPayment = await this._payments.update(_id, data);
      if (user_id) {
        await this.createAndSendNotification(updatedPayment, user_id);
      }
      return updatedPayment;
    } catch (error) {
      throw error;
    }
  }
}

export default PaymentService;
