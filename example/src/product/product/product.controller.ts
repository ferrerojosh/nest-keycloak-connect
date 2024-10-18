import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Public, Resource, Roles, Scopes } from 'nest-keycloak-connect';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller('product')
@Resource(Product.name)
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @Public()
  @Scopes('View')
  findAll() {
    return this.service.findAll();
  }

  @Get(':code')
  @Roles({ roles: ['realm:basic'] })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Post()
  @Scopes('Create')
  create(@Body() product: Product) {
    return this.service.create(product);
  }

  @Delete(':code')
  @Scopes('Delete')
  deleteByCode(@Param('code') code: string) {
    return this.service.deleteByCode(code);
  }

  @Put(':code')
  @Scopes('Edit')
  update(@Param('code') code: string, @Body() product: Product) {
    return this.service.update(code, product);
  }
}
