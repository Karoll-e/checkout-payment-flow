import { Injectable } from '@nestjs/common';
import { DeliveryRepositoryPort } from '../../../domain/ports/delivery-repository.port.js';
import { Delivery } from '../../../domain/entities/delivery.entity.js';
import { PrismaService } from '../../persistence/prisma/prisma.service.js';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(delivery: Delivery): Promise<Delivery> {
    const row = await this.prisma.delivery.create({
      data: {
        id: delivery.id,
        address: delivery.address,
        city: delivery.city,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.prisma.delivery.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    id: string;
    address: string;
    city: string;
  }): Delivery {
    return new Delivery(row.id, row.address, row.city);
  }
}