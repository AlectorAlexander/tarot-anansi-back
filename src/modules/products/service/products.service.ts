import { IService } from 'src/modules/interfaces/IService';
import { SafeParseError } from 'zod';
import { Injectable } from '@nestjs/common';
import { IProduct, productValidationSchema } from '../dtos/products.dtos';
import ProductModel from '../entities/products.entity';

@Injectable()
class ProductService implements IService<IProduct> {
  private _product: ProductModel;

  constructor() {
    this._product = new ProductModel();
  }

  private sortByDateCreation(a: IProduct, b: IProduct): number {
    const dateA = a.date_creation || new Date(0);
    const dateB = b.date_creation || new Date(0);
    return dateA.getTime() - dateB.getTime();
  }

  private async validateDataAndCreate(data: IProduct): Promise<IProduct> {
    const parsed = productValidationSchema.safeParse(data);

    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IProduct>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const product = await this._product.create(data);
    return product;
  }

  public async create(data: IProduct): Promise<IProduct> {
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<IProduct> {
    try {
      return await this._product.delete(id);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<IProduct[]> {
    try {
      const productsFromDB = await this._product.read();
      const products = productsFromDB.map((product) => ({
        ...product,
      }));

      products.sort(this.sortByDateCreation);

      return products;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<IProduct> {
    try {
      const product = await this._product.readOne(id);
      return product;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, data: IProduct): Promise<IProduct> {
    const parsed = productValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IProduct>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedProducts = await this._product.update(id, data);
      return updatedProducts;
    } catch (error) {
      throw error;
    }
  }
}

export default ProductService;
