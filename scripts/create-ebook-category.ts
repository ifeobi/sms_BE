import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEbookCategory() {
  try {
    // Check if ebook category already exists
    const existing = await prisma.contentCategory.findUnique({
      where: { name: 'ebook' }
    });

    if (existing) {
      console.log('✅ Ebook category already exists:', existing);
      return;
    }

    // Create the ebook category
    const ebookCategory = await prisma.contentCategory.create({
      data: {
        name: 'ebook',
        description: 'Digital ebooks and electronic books'
      }
    });

    console.log('✅ Created ebook category:', ebookCategory);
  } catch (error) {
    console.error('❌ Error creating ebook category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEbookCategory();

