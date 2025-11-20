import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectEbookContent() {
  try {
    const results = await prisma.content.findMany({
      where: {
        contentCategory: {
          name: 'ebook',
        },
      },
      include: {
        contentCategory: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('Found ebook content:', results.map((item) => ({
      id: item.id,
      title: item.title,
      contentCategoryId: item.contentCategoryId,
      contentCategoryName: item.contentCategory?.name,
      contentType: item.contentType,
      digitalPrice: item.digitalPrice?.toString(),
      textbookPrice: item.textbookPrice?.toString(),
      createdAt: item.createdAt,
    })));
  } catch (error) {
    console.error('Failed to inspect ebook content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectEbookContent();
