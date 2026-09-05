import { Transaction } from '../entities/transaction.entity.js';

export interface TransactionRepositoryPort {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
}