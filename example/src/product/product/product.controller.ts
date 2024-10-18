import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ConditionalScopes,
  Public,
  ResolvedScopes,
  Resource,
  Roles,
  Scopes,
} from 'nest-keycloak-connect';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller('product')
@Resource(Product.name)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private service: ProductService) {}

  @Get()
  @Public()
  @ConditionalScopes((request, token) => {
    if (token.hasRealmRole('basic')) {
      return ['View'];
    }
    if (token.hasRealmRole('admin')) {
      return ['View.All'];
    }
    return [];
  })
  findAll(@ResolvedScopes() scopes: string[]) {
    if (scopes.includes('View.All')) {
      return this.service.findAll();
    }
    return this.service.findByCode('1-00-1');
  }

  @Get(':code')
  @Roles('realm:basic', 'realm:admin')
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
