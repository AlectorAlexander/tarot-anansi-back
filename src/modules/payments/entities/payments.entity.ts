import { Document, model as mongooseCreateModel, Schema } from 'mongoose';
import MongoModel from '../../MongoModel';
import { IPayments } from '../dtos/payments.dtos';

export const PaymentsSchema = new Schema<IPayments & Document>({
  schedule_id: { type: String, required: true },
  paymentIntentId: { type: String, required: false },
  price: { type: Number, required: true },
  status: { type: String, default: 'pendente', required: true },
  date_creation: { type: Date, default: Date.now, required: true },
  date_update: { type: Date, default: Date.now, required: true },
});

class PaymentsModel extends MongoModel<IPayments & Document> {
  constructor(model = mongooseCreateModel('payments', PaymentsSchema)) {
    super(model);
  }
}

export default PaymentsModel;
