import { Module } from '@nestjs/common';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';

@Module({
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
