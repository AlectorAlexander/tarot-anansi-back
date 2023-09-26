import { Model, Document, isValidObjectId, FilterQuery } from 'mongoose';
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

  public async read(filter?: FilterQuery<T>): Promise<T[]> {
    try {
      let objs: T[];
      if (filter) {
        objs = await this.model.find(filter);
      } else {
        objs = await this.model.find();
      }
      return objs;
    } catch (error) {
      throw error;
    }
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
    const updatedObj = await this.model.findByIdAndUpdate(_id, obj, {
      new: true,
    });
    return updatedObj;
  }

  async updateByEmail(email: string, obj: Partial<T>): Promise<T | null> {
    if (!email) {
      throw new Error('Email is required.');
    }
    const updatedObj = await this.model.findOneAndUpdate(
      { email: email },
      obj,
      {
        new: true,
      },
    );
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
