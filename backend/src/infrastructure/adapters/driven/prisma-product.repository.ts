import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from '../../../domain/ports/product-repository.port.js';
import { Product } from '../../../domain/entities/product.entity.js';
import { PrismaService } from '../../persistence/prisma/prisma.service.js';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async decreaseStock(id: string, quantity: number): Promise<void> {
    const result = await this.prisma.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (result.count === 0) {
      throw new Error('Insufficient stock or product not found');
    }
  }

  private toDomain(row: {
    id: string;
    name: string;
    description: string;
    price: unknown;
    stock: number;
    imageUrl: string | null;
  }): Product {
    return new Product(
      row.id,
      row.name,
      row.description,
      Number(row.price),
      row.stock,
      row.imageUrl ?? undefined,
    );
  }
}