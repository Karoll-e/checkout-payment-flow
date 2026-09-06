import { jest } from '@jest/globals';
import { ConfirmPaymentUseCase } from './confirm-payment.use-case.js';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port.js';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port.js';
import type { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port.js';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port.js';

function buildPendingTransaction() {
  return new Transaction(
    'tx-1',
    'product-1',
    2,
    'customer-1',
    'delivery-1',
    100000,
    5000,
    10000,
  );
}

describe('ConfirmPaymentUseCase', () => {
  let transactionRepo: jest.Mocked<TransactionRepositoryPort>;
  let productRepo: jest.Mocked<ProductRepositoryPort>;
  let customerRepo: jest.Mocked<CustomerRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let useCase: ConfirmPaymentUseCase;

  beforeEach(() => {
    transactionRepo = { create: jest.fn(), findById: jest.fn(), save: jest.fn() };
    productRepo = { findAll: jest.fn(), findById: jest.fn(), decreaseStock: jest.fn() };
    customerRepo = { create: jest.fn(), findById: jest.fn() };
    paymentGateway = { charge: jest.fn() };

    useCase = new ConfirmPaymentUseCase(
      transactionRepo,
      productRepo,
      customerRepo,
      paymentGateway,
    );
  });

  it('aprueba el pago y descuenta stock', async () => {
    const tx = buildPendingTransaction();
    transactionRepo.findById.mockResolvedValue(tx);
    customerRepo.findById.mockResolvedValue(
      new Customer('customer-1', 'Karoll', 'karoll@test.com', '+573001234567'),
    );
    paymentGateway.charge.mockResolvedValue({
      externalId: 'wompi-123',
      status: 'APPROVED',
    });

    const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok_test' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe(TransactionStatus.APPROVED);
      expect(result.value.wompiTransactionId).toBe('wompi-123');
    }
    expect(productRepo.decreaseStock).toHaveBeenCalledWith('product-1', 2);
    expect(transactionRepo.save).toHaveBeenCalled();
  });

  it('declina el pago y NO descuenta stock', async () => {
    const tx = buildPendingTransaction();
    transactionRepo.findById.mockResolvedValue(tx);
    customerRepo.findById.mockResolvedValue(
      new Customer('customer-1', 'Karoll', 'karoll@test.com', '+573001234567'),
    );
    paymentGateway.charge.mockResolvedValue({
      externalId: 'wompi-123',
      status: 'DECLINED',
      message: 'Fondos insuficientes',
    });

    const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok_test' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe(TransactionStatus.DECLINED);
    }
    expect(productRepo.decreaseStock).not.toHaveBeenCalled();
  });

  it('marca error si el gateway falla técnicamente', async () => {
    const tx = buildPendingTransaction();
    transactionRepo.findById.mockResolvedValue(tx);
    customerRepo.findById.mockResolvedValue(
      new Customer('customer-1', 'Karoll', 'karoll@test.com', '+573001234567'),
    );
    paymentGateway.charge.mockResolvedValue({
      externalId: '',
      status: 'ERROR',
      message: 'Timeout',
    });

    const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok_test' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe(TransactionStatus.ERROR);
    }
    expect(productRepo.decreaseStock).not.toHaveBeenCalled();
  });

  it('falla si la transacción no existe', async () => {
    transactionRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({ transactionId: 'no-existe', cardToken: 'tok' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('TRANSACTION_NOT_FOUND');
    }
    expect(paymentGateway.charge).not.toHaveBeenCalled();
  });

  it('falla si la transacción ya fue resuelta (evita doble cobro)', async () => {
    const tx = buildPendingTransaction();
    tx.markApproved('wompi-anterior');
    transactionRepo.findById.mockResolvedValue(tx);

    const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('TRANSACTION_ALREADY_RESOLVED');
    }
    expect(paymentGateway.charge).not.toHaveBeenCalled();
  });

  it('falla si el customer no existe', async () => {
    const tx = buildPendingTransaction();
    transactionRepo.findById.mockResolvedValue(tx);
    customerRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('CUSTOMER_NOT_FOUND');
    }
  });

  it('marca error con mensaje por defecto si el gateway no da mensaje', async () => {
  const tx = buildPendingTransaction();
  transactionRepo.findById.mockResolvedValue(tx);
  customerRepo.findById.mockResolvedValue(
    new Customer('customer-1', 'Karoll', 'karoll@test.com', '+573001234567'),
  );
  paymentGateway.charge.mockResolvedValue({
    externalId: '',
    status: 'ERROR',
    // sin "message"
  });

  const result = await useCase.execute({ transactionId: 'tx-1', cardToken: 'tok_test' });

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value.errorMessage).toBe('Unknown payment error');
  }
});
});