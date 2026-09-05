import { Customer } from '../entities/customer.entity.js';

export interface CustomerRepositoryPort {
  create(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
}