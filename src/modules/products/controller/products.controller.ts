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
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import { IProduct } from '../dtos/products.dtos';
import ProductService from '../service/products.service';
import { log } from 'console';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() data: IProduct): Promise<IProduct> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const product = await this.productService.create(data);
        return product;
      } else {
        throw new BadRequestException({
          message: 'Failed to create product',
          details: 'Only admins can create products',
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException({
          message: error.message,
          details: error || 'An unexpected error occurred',
        });
      }
    }
  }

  @Get()
  async read(): Promise<IProduct[]> {
    try {
      const products = await this.productService.read();
      return products;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Retorna a mensagem de erro personalizada do serviço
      } else {
        throw new BadRequestException({
          message: error.message,
          details: error || 'An unexpected error occurred',
        });
      }
    }
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<IProduct> {
    try {
      const product = await this.productService.readOne(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Retorna a mensagem de erro personalizada do serviço
      } else {
        throw new NotFoundException('Product not found');
      }
    }
  }

  @Put('updateWithout/:id')
  async updateWithoutToken(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { data, secret }: { data: IProduct; secret: string },
  ): Promise<IProduct> {
    try {
      if (secret === process.env.APP_SECRET_KEY) {
        const updatedProduct = await this.productService.update(id, data);
        if (!updatedProduct) {
          throw new NotFoundException('Product not found');
        }
        return updatedProduct;
      } else {
        throw new BadRequestException({
          message: 'Failed to update product',
          details: 'Only admins can update products',
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Retorna a mensagem de erro personalizada do serviço
      } else {
        throw new BadRequestException({
          message: error.message,
          details: error || 'An unexpected error occurred',
        });
      }
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { data, secret }: { data: IProduct; secret: string },
  ): Promise<IProduct> {
    try {
      const role = req.user.role;
      if (role === 'admin' || secret === process.env.APP_SECRET_KEY) {
        const updatedProduct = await this.productService.update(id, data);
        if (!updatedProduct) {
          throw new NotFoundException('Product not found');
        }
        return updatedProduct;
      } else {
        throw new BadRequestException({
          message: 'Failed to update product',
          details: 'Only admins can update products',
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Retorna a mensagem de erro personalizada do serviço
      } else {
        throw new BadRequestException({
          message: error.message,
          details: error || 'An unexpected error occurred',
        });
      }
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
        const deletedProduct = await this.productService.delete(id);
        if (!deletedProduct) {
          throw new NotFoundException('Product not found');
        }
        return deletedProduct;
      } else {
        throw new BadRequestException({
          message: 'Failed to delete product',
          details: 'Only admins can delete products',
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Retorna a mensagem de erro personalizada do serviço
      } else {
        throw new BadRequestException({
          message: error.message,
          details: error || 'An unexpected error occurred',
        });
      }
    }
  }
}
