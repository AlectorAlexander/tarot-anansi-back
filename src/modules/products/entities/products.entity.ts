import { model as mongooseCreateModel, Document, Schema } from 'mongoose';
import MongoModel from '../../MongoModel';
import { IProduct } from '../dtos/products.dtos';

export const productSchema = new Schema<IProduct & Document>({
  description: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  duracao: { type: String, required: true },
  price: { type: Number, required: true },
  date_creation: { type: Date, default: Date.now, required: true },
  date_update: { type: Date, default: Date.now, required: true },
  stripe_id: { type: String, required: false },
});

class productModel extends MongoModel<IProduct & Document> {
  constructor(model = mongooseCreateModel('products', productSchema)) {
    super(model);
  }
}
export default productModel;
