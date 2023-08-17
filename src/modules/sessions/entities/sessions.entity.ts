import { model as mongooseCreateModel, Document, Schema } from 'mongoose';
import MongoModel from '../../MongoModel';
import { ISessions } from '../dtos/sessions.dtos';

export const sessionSchema = new Schema<ISessions & Document>({
  schedule_id: { type: String, required: true },
  date: { type: String, required: true },
  price: { type: Number, required: true },
  date_creation: { type: Date, default: Date.now, required: true },
  date_update: { type: Date, default: Date.now, required: true },
});

class SessionsModel extends MongoModel<ISessions & Document> {
  constructor(model = mongooseCreateModel('sessions', sessionSchema)) {
    super(model);
  }
}
export default SessionsModel;
