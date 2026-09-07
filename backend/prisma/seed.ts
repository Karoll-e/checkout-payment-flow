import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const products = [
    {
      name: 'Game Boy',
      description: 'The legendary handheld console that started it all.',
      price: 149900,
      stock: 12,
      imageUrl: '/nintendo-image.png',
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