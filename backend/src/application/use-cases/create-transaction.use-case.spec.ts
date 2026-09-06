import { jest } from '@jest/globals';
import { CreateTransactionUseCase } from './create-transaction.use-case.js';
import { Product } from '../../domain/entities/product.entity.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { Delivery } from '../../domain/entities/delivery.entity.js';
import { Transaction } from '../../domain/entities/transaction.entity.js';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port.js';
import type { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port.js';
import type { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port.js';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port.js';

describe('CreateTransactionUseCase', () => {
  let productRepo: jest.Mocked<ProductRepositoryPort>;
  let customerRepo: jest.Mocked<CustomerRepositoryPort>;
  let deliveryRepo: jest.Mocked<DeliveryRepositoryPort>;
  let transactionRepo: jest.Mocked<TransactionRepositoryPort>;
  let useCase: CreateTransactionUseCase;

  const validInput = {
    productId: 'product-1',
    quantity: 2,
    customer: { name: 'Karoll', email: 'karoll@test.com', phone: '+573001234567' },
    delivery: { address: 'Calle 123', city: 'Cartagena' },
    deliveryFee: 10000,
  };

  beforeEach(() => {
    productRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };
    customerRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    deliveryRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    transactionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreateTransactionUseCase(
      productRepo,
      customerRepo,
      deliveryRepo,
      transactionRepo,
    );
  });

  it('crea la transacción cuando todo es válido', async () => {
    const product = new Product('product-1', 'Mouse', 'desc', 50000, 10);
    productRepo.findById.mockResolvedValue(product);

    customerRepo.create.mockImplementation(async (c) => c);
    deliveryRepo.create.mockImplementation(async (d) => d);
    transactionRepo.create.mockImplementation(async (t) => t);

    const result = await useCase.execute(validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.productId).toBe('product-1');
      expect(result.value.quantity).toBe(2);
      expect(result.value.productAmount).toBe(100000); // 50000 * 2
      expect(result.value.totalAmount).toBe(115000); // + 5000 baseFee + 10000 deliveryFee
    }
  });

  it('falla si el producto no existe', async () => {
    productRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(validInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('PRODUCT_NOT_FOUND');
    }
    expect(customerRepo.create).not.toHaveBeenCalled();
  });

  it('falla si no hay stock suficiente', async () => {
    const product = new Product('product-1', 'Mouse', 'desc', 50000, 1);
    productRepo.findById.mockResolvedValue(product);

    const result = await useCase.execute(validInput); // pide quantity: 2

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INSUFFICIENT_STOCK');
    }
  });

  it('falla si los datos del cliente son inválidos', async () => {
    const product = new Product('product-1', 'Mouse', 'desc', 50000, 10);
    productRepo.findById.mockResolvedValue(product);

    const result = await useCase.execute({
      ...validInput,
      customer: { ...validInput.customer, email: 'no-valido' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_CUSTOMER_DATA');
    }
  });

  it('falla si los datos de entrega son inválidos', async () => {
    const product = new Product('product-1', 'Mouse', 'desc', 50000, 10);
    productRepo.findById.mockResolvedValue(product);

    const result = await useCase.execute({
      ...validInput,
      delivery: { address: '', city: 'Cartagena' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_DELIVERY_DATA');
    }
  });
});