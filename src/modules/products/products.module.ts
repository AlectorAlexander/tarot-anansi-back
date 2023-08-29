import { Module } from '@nestjs/common';
import ProductService from './service/products.service';
import { ProductController } from './controller/products.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class productsModule {}
