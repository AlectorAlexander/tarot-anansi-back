import { Document, model as mongooseCreateModel, Schema } from 'mongoose';
import { INotifications } from '../dtos/notifications.dtos';
import MongoModel from '../../MongoModel';

export const NotificationSchema = new Schema<INotifications & Document>({
  user_id: { type: String, required: true },
  message: { type: String, required: true },
  notification_date: { type: Date, default: Date.now, required: true },
  read: { type: Boolean, default: false, required: true },
  date_creation: { type: Date, default: Date.now, required: true },
  date_update: { type: Date, default: Date.now, required: true },
});

class NotificationModel extends MongoModel<INotifications & Document> {
  constructor(
    model = mongooseCreateModel('notifications', NotificationSchema),
  ) {
    super(model);
  }
}

export default NotificationModel;
