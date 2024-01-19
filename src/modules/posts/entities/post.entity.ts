import { model as mongooseCreateModel, Document, Schema } from 'mongoose';
import MongoModel from '../../MongoModel';
import { IPost } from '../dtos/post.dtos';

export const postSchema = new Schema<IPost & Document>({
  content: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  date_creation: { type: Date, default: Date.now, required: true },
  date_update: { type: Date, default: Date.now, required: true },
});

class PostModel extends MongoModel<IPost & Document> {
  constructor(model = mongooseCreateModel('posts', postSchema)) {
    super(model);
  }
}
export default PostModel;
