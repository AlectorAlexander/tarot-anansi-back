import { model as mongooseCreateModel, Document, Schema } from 'mongoose';
import MongoModel from '../../../modules/MongoModel';
import { IUser } from '../dtos/users.dtos';

export const UserSchema = new Schema<IUser & Document>({
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  profile_photo: {
    type: String,
    required: false,
  },
  google_id: {
    type: String,
    required: false,
  },
  facebook_id: {
    type: String,
    required: false,
  },
  date_creation: {
    type: Date,
    default: Date.now,
    required: true,
  },
  date_update: {
    type: Date,
    default: Date.now,
    required: false,
  },
});

class UserModel extends MongoModel<IUser & Document> {
  constructor(model = mongooseCreateModel('users', UserSchema)) {
    super(model);
  }
}

export default UserModel;
