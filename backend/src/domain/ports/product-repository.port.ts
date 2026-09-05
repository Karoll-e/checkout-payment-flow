import { Product } from '../entities/product.entity.js';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(id: string, quantity: number): Promise<void>;
}