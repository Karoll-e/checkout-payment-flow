import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service.js';
import { PrismaProductRepository } from './infrastructure/adapters/driven/prisma-product.repository.js';
import { ProductController } from './infrastructure/adapters/driving/product.controller.js';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [
    PrismaService,
    {
      provide: 'ProductRepositoryPort',
      useClass: PrismaProductRepository,
    },
  ],
})
export class AppModule {}