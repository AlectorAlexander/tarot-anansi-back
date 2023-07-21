import { Model, Document, isValidObjectId } from 'mongoose';
import { IModel } from './interfaces/IModel';

abstract class MongoModel<T extends Document> implements IModel<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }
  
  async create(obj: Partial<T>): Promise<T> {

    const createdObj = await this.model.create(obj);
    return createdObj;
  }

  async read(): Promise<T[]> {
    const objs = await this.model.find();
    return objs;
  }

  async readOne(_id: string): Promise<T | null> {
    if (!isValidObjectId(_id)) {
      throw new Error('Invalid _id format.');
    }
    const obj = await this.model.findById(_id);
    return obj;
  }

  async readOneByEmail(email: string): Promise<T | null> {
    const obj = await this.model.findOne({ email });
    return obj;
  }

  async update(_id: string, obj: Partial<T>): Promise<T | null> {
    if (!isValidObjectId(_id)) {
      throw new Error('Invalid _id format.');
    }
    const updatedObj = await this.model.findByIdAndUpdate(_id, obj, { new: true });
    return updatedObj;
  }

  async delete(_id: string): Promise<T | null> {
    if (!isValidObjectId(_id)) {
      throw new Error('Invalid _id format.');
    }
    const deletedObj = await this.model.findByIdAndDelete(_id);
    return deletedObj;
  }
}

export default MongoModel;
