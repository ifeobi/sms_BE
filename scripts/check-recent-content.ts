import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== Checking Recent Content ===\n');
    
    const recentContent = await prisma.content.findMany({
      include: {
        contentCategory: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`Found ${recentContent.length} recent content items:\n`);
    
    recentContent.forEach((item, index) => {
      console.log(`${index + 1}. Content ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   contentCategoryId: ${item.contentCategoryId}`);
      console.log(`   Category Name (from relation): ${item.contentCategory?.name || 'NULL'}`);
      console.log(`   Category ID matches: ${item.contentCategoryId === item.contentCategory?.id}`);
      console.log(`   contentType: ${item.contentType}`);
      console.log('');
    });

    // Check for ebook category
    const ebookCategory = await prisma.contentCategory.findUnique({
      where: { name: 'ebook' }
    });
    
    console.log('\n=== Ebook Category Check ===');
    if (ebookCategory) {
      console.log(`✅ Ebook category exists:`);
      console.log(`   ID: ${ebookCategory.id}`);
      console.log(`   Name: ${ebookCategory.name}`);
    } else {
      console.log('❌ Ebook category NOT FOUND!');
    }

    // Check how many contents use ebook category
    const ebookContents = await prisma.content.findMany({
      where: {
        contentCategoryId: ebookCategory?.id
      }
    });
    
    console.log(`\n=== Contents with ebook category: ${ebookContents.length} ===`);
    ebookContents.forEach(item => {
      console.log(`- ${item.title} (ID: ${item.id})`);
    });

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
