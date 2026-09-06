import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { Delivery } from '../../domain/entities/delivery.entity.js';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port.js';
import type { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port.js';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port.js';
import { Result, ok, fail } from '../shared/result.js';

const BASE_FEE = 5000; // tarifa fija del negocio, en pesos

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string };
  deliveryFee: number;
}

export type CreateTransactionError =
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_CUSTOMER_DATA'
  | 'INVALID_DELIVERY_DATA';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepo: ProductRepositoryPort,
    @Inject('CustomerRepositoryPort')
    private readonly customerRepo: CustomerRepositoryPort,
    @Inject('DeliveryRepositoryPort')
    private readonly deliveryRepo: DeliveryRepositoryPort,
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<Transaction, CreateTransactionError>> {
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      return fail('PRODUCT_NOT_FOUND');
    }
    if (!product.hasStock(input.quantity)) {
      return fail('INSUFFICIENT_STOCK');
    }

    let customer: Customer;
    try {
      customer = new Customer(
        randomUUID(),
        input.customer.name,
        input.customer.email,
        input.customer.phone,
      );
    } catch {
      return fail('INVALID_CUSTOMER_DATA');
    }

    let delivery: Delivery;
    try {
      delivery = new Delivery(
        randomUUID(),
        input.delivery.address,
        input.delivery.city,
      );
    } catch {
      return fail('INVALID_DELIVERY_DATA');
    }

    const savedCustomer = await this.customerRepo.create(customer);
    const savedDelivery = await this.deliveryRepo.create(delivery);

    const productAmount = product.price * input.quantity;

    const transaction = new Transaction(
      randomUUID(),
      product.id,
      input.quantity,
      savedCustomer.id,
      savedDelivery.id,
      productAmount,
      BASE_FEE,
      input.deliveryFee,
    );

    const saved = await this.transactionRepo.create(transaction);
    return ok(saved);
  }
}