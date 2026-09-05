import { Delivery } from '../entities/delivery.entity.js';

export interface DeliveryRepositoryPort {
  create(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
}