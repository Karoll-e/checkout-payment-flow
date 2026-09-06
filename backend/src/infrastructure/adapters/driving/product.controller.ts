import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import type { ProductRepositoryPort } from '../../../domain/ports/product-repository.port.js';
import { ProductResponseDto } from './dtos/product-response.dto.js';

@Controller('products')
export class ProductController {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepo: ProductRepositoryPort,
  ) {}

  @Get()
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepo.findAll();
    return products.map(ProductResponseDto.fromDomain);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ProductResponseDto.fromDomain(product);
  }
}