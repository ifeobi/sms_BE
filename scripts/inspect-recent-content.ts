import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectRecentContent() {
  try {
    const results = await prisma.content.findMany({
      include: {
        contentCategory: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('Recent content:', results.map((item) => ({
      id: item.id,
      title: item.title,
      categoryName: item.contentCategory?.name,
      categoryId: item.contentCategoryId,
      contentType: item.contentType,
      digitalPrice: item.digitalPrice?.toString(),
      textbookPrice: item.textbookPrice?.toString(),
      createdAt: item.createdAt,
    })));
  } catch (error) {
    console.error('Failed to inspect recent content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectRecentContent();
