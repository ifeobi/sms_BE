const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function backfillMarketplaceDates() {
  console.log('Starting backfill of marketplace publication dates...');
  
  try {
    // Find all content that has marketplace items but no marketplacePublishedAt
    const contentWithoutDates = await prisma.content.findMany({
      where: {
        marketplaceItem: {
          isNot: null
        },
        marketplacePublishedAt: null
      },
      include: {
        marketplaceItem: true
      }
    });

    console.log(`Found ${contentWithoutDates.length} content items without publication dates`);

    // Update each content item with the marketplace item creation date
    for (const content of contentWithoutDates) {
      if (content.marketplaceItem && content.marketplaceItem.createdAt) {
        await prisma.content.update({
          where: { id: content.id },
          data: {
            marketplacePublishedAt: content.marketplaceItem.createdAt
          }
        });
        
        console.log(`Updated content "${content.title}" with publication date: ${content.marketplaceItem.createdAt}`);
      }
    }

    console.log('Backfill completed successfully!');
    
  } catch (error) {
    console.error('Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillMarketplaceDates();
