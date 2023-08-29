import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import { IProduct } from '../dtos/products.dtos';
import ProductService from '../service/products.service';

@Controller('products')
export class ProductController {
  constructor(private readonly ProductService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() data: IProduct): Promise<IProduct> {
    try {
      console.log(req.user);
      const role = req.user.role;
      if (role === 'admin') {
        const product = await this.ProductService.create(data);
        return product;
      } else {
        throw new BadRequestException({
          message: 'Failed to create product',
          details: 'Only admins can create products',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create product',
        details: error.message,
      });
    }
  }

  @Get()
  async read(): Promise<IProduct[]> {
    try {
      const products = await this.ProductService.read();
      return products;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to read products',
        details: error.message,
      });
    }
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<IProduct> {
    try {
      const product = await this.ProductService.readOne(id);
      if (!product) {
        throw new NotFoundException('product not found');
      }
      return product;
    } catch (error) {
      throw new NotFoundException('product not found');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: IProduct,
  ): Promise<IProduct> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const updatedProduct = await this.ProductService.update(id, data);
        if (!updatedProduct) {
          throw new NotFoundException('product not found');
        }
        return updatedProduct;
      } else {
        throw new BadRequestException({
          message: 'Failed to update product',
          details: 'Only admins can update products',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update product',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<IProduct> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const deletedProduct = await this.ProductService.delete(id);
        if (!deletedProduct) {
          throw new NotFoundException('product not found');
        }
        return deletedProduct;
      } else {
        throw new BadRequestException({
          message: 'Failed to delete product',
          details: 'Only admins can delete products',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete product',
        details: error.message,
      });
    }
  }
}
