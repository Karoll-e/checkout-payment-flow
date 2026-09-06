import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service.js';
import { PrismaProductRepository } from './infrastructure/adapters/driven/prisma-product.repository.js';
import { PrismaCustomerRepository } from './infrastructure/adapters/driven/prisma-customer.repository.js';
import { PrismaDeliveryRepository } from './infrastructure/adapters/driven/prisma-delivery.repository.js';
import { PrismaTransactionRepository } from './infrastructure/adapters/driven/prisma-transaction.repository.js';
import { WompiPaymentGateway } from './infrastructure/adapters/driven/wompi-payment.gateway.js';
import { ProductController } from './infrastructure/adapters/driving/product.controller.js';
import { TransactionController } from './infrastructure/adapters/driving/transaction.controller.js';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case.js';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case.js';

@Module({
  imports: [],
  controllers: [ProductController, TransactionController],
  providers: [
    PrismaService,
    { provide: 'ProductRepositoryPort', useClass: PrismaProductRepository },
    { provide: 'CustomerRepositoryPort', useClass: PrismaCustomerRepository },
    { provide: 'DeliveryRepositoryPort', useClass: PrismaDeliveryRepository },
    { provide: 'TransactionRepositoryPort', useClass: PrismaTransactionRepository },
    { provide: 'PaymentGatewayPort', useClass: WompiPaymentGateway },
    CreateTransactionUseCase,
    ConfirmPaymentUseCase,
  ],
})
export class AppModule {}