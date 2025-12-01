import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCategories() {
  try {
    const categories = await prisma.contentCategory.findMany({
      orderBy: { name: 'asc' },
    });
    console.log('Content categories:', categories.map((cat) => ({ id: cat.id, name: cat.name })));
  } catch (error) {
    console.error('Failed to list content categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCategories();
