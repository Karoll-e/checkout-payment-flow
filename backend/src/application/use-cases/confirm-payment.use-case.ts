import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity.js';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port.js';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port.js';
import type { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port.js';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port.js';
import { Result, ok, fail } from '../shared/result.js';

export interface ConfirmPaymentInput {
  transactionId: string;
  cardToken: string;
}

export type ConfirmPaymentError =
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_ALREADY_RESOLVED'
  | 'CUSTOMER_NOT_FOUND';

@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepo: TransactionRepositoryPort,
    @Inject('ProductRepositoryPort')
    private readonly productRepo: ProductRepositoryPort,
    @Inject('CustomerRepositoryPort')
    private readonly customerRepo: CustomerRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    input: ConfirmPaymentInput,
  ): Promise<Result<Transaction, ConfirmPaymentError>> {
    const transaction = await this.transactionRepo.findById(
      input.transactionId,
    );
    if (!transaction) {
      return fail('TRANSACTION_NOT_FOUND');
    }
    if (!transaction.isPending) {
      return fail('TRANSACTION_ALREADY_RESOLVED');
    }

    const customer = await this.customerRepo.findById(transaction.customerId);
    if (!customer) {
      return fail('CUSTOMER_NOT_FOUND');
    }

    const paymentResult = await this.paymentGateway.charge({
      cardToken: input.cardToken,
      amountInCents: Math.round(transaction.totalAmount * 100),
      currency: 'COP',
      customerEmail: customer.email,
      reference: transaction.id,
    });

    switch (paymentResult.status) {
      case 'APPROVED':
        transaction.markApproved(paymentResult.externalId);
        break;
      case 'DECLINED':
        transaction.markDeclined(paymentResult.externalId, paymentResult.message);
        break;
      case 'ERROR':
        transaction.markError(paymentResult.message ?? 'Unknown payment error');
        break;
    }

    await this.transactionRepo.save(transaction);

    if (transaction.status === 'APPROVED') {
      await this.productRepo.decreaseStock(
        transaction.productId,
        transaction.quantity,
      );
    }

    return ok(transaction);
  }
}