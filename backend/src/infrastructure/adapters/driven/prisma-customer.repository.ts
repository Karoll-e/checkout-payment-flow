import { Injectable } from '@nestjs/common';
import { CustomerRepositoryPort } from '../../../domain/ports/customer-repository.port.js';
import { Customer } from '../../../domain/entities/customer.entity.js';
import { PrismaService } from '../../persistence/prisma/prisma.service.js';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const row = await this.prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    id: string;
    name: string;
    email: string;
    phone: string;
  }): Customer {
    return new Customer(row.id, row.name, row.email, row.phone);
  }
}