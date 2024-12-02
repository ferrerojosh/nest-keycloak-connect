import { Injectable } from '@nestjs/common';
import { Product } from './product';

@Injectable()
export class ProductService {
  products: Product[] = [
    {
      code: '1-00-1',
    },
    {
      code: '1-00-2',
    },
    {
      code: '1-00-3',
    },
  ];

  update(code: string, product: Product) {
    this.products = this.products.map((p) => {
      if (p.code === code) {
        return product;
      } else {
        return p;
      }
    });
  }

  deleteByCode(code: string) {
    this.products = this.products.filter((p) => p.code !== code);
  }

  create(product: Product) {
    this.products = [...this.products, product];
  }

  findByCode(code: string) {
    return this.products.find((p) => p.code === code);
  }

  findAll() {
    return this.products;
  }
}
