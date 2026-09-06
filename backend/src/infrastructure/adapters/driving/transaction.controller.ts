import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case.js';
import { ConfirmPaymentUseCase } from '../../../application/use-cases/confirm-payment.use-case.js';
import type { TransactionRepositoryPort } from '../../../domain/ports/transaction-repository.port.js';
import { CreateTransactionDto } from './dtos/create-transaction.dto.js';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto.js';
import { TransactionResponseDto } from './dtos/transaction-response.dto.js';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const result = await this.createTransactionUseCase.execute(dto);

    if (!result.ok) {
      switch (result.error) {
        case 'PRODUCT_NOT_FOUND':
          throw new NotFoundException('Product not found');
        case 'INSUFFICIENT_STOCK':
          throw new ConflictException('Insufficient stock');
        case 'INVALID_CUSTOMER_DATA':
          throw new BadRequestException('Invalid customer data');
        case 'INVALID_DELIVERY_DATA':
          throw new BadRequestException('Invalid delivery data');
      }
    }

    return TransactionResponseDto.fromDomain(result.value);
  }

  @Post(':id/confirm')
  async confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<TransactionResponseDto> {
    const result = await this.confirmPaymentUseCase.execute({
      transactionId: id,
      cardToken: dto.cardToken,
    });

    if (!result.ok) {
      switch (result.error) {
        case 'TRANSACTION_NOT_FOUND':
          throw new NotFoundException('Transaction not found');
        case 'TRANSACTION_ALREADY_RESOLVED':
          throw new ConflictException('Transaction already resolved');
        case 'CUSTOMER_NOT_FOUND':
          throw new NotFoundException('Customer not found');
      }
    }

    return TransactionResponseDto.fromDomain(result.value);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return TransactionResponseDto.fromDomain(transaction);
  }
}