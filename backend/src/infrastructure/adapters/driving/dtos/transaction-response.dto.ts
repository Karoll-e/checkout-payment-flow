import { Transaction } from '../../../../domain/entities/transaction.entity.js';

export class TransactionResponseDto {
  id: string;
  status: string;
  productId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  wompiTransactionId?: string;
  errorMessage?: string;

  static fromDomain(tx: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = tx.id;
    dto.status = tx.status;
    dto.productId = tx.productId;
    dto.quantity = tx.quantity;
    dto.productAmount = tx.productAmount;
    dto.baseFee = tx.baseFee;
    dto.deliveryFee = tx.deliveryFee;
    dto.totalAmount = tx.totalAmount;
    dto.wompiTransactionId = tx.wompiTransactionId;
    dto.errorMessage = tx.errorMessage;
    return dto;
  }
}