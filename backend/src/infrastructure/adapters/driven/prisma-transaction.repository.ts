import { Injectable } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction-repository.port.js';
import { Transaction, TransactionStatus } from '../../../domain/entities/transaction.entity.js';
import { PrismaService } from '../../persistence/prisma/prisma.service.js';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const row = await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        productId: transaction.productId,
        quantity: transaction.quantity,
        customerId: transaction.customerId,
        deliveryId: transaction.deliveryId,
        productAmount: transaction.productAmount,
        baseFee: transaction.baseFee,
        deliveryFee: transaction.deliveryFee,
        status: transaction.status,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transaction.status,
        wompiTransactionId: transaction.wompiTransactionId,
        errorMessage: transaction.errorMessage,
        updatedAt: transaction.updatedAt,
      },
    });
  }

  private toDomain(row: {
    id: string;
    productId: string;
    quantity: number;
    customerId: string;
    deliveryId: string;
    productAmount: unknown;
    baseFee: unknown;
    deliveryFee: unknown;
    status: string;
    wompiTransactionId: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction(
      row.id,
      row.productId,
      row.quantity,
      row.customerId,
      row.deliveryId,
      Number(row.productAmount),
      Number(row.baseFee),
      Number(row.deliveryFee),
      row.status as TransactionStatus,
      row.createdAt,
      row.updatedAt,
      row.wompiTransactionId ?? undefined,
      row.errorMessage ?? undefined,
    );
  }
}