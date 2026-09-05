import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const products = [
    {
      name: 'Auriculares inalámbricos',
      description: 'Auriculares bluetooth con cancelación de ruido',
      price: 149900,
      stock: 15,
      imageUrl: 'https://via.placeholder.com/300?text=Auriculares',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seed completado: ${products.length} productos creados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });