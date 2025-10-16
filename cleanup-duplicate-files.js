const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateFiles() {
  try {
 
    
    // Find content items that have multiple files of the same type
    const contentWithMultipleFiles = await prisma.content.findMany({
      include: {
        files: true,
      },
    });

    let totalDeleted = 0;

    for (const content of contentWithMultipleFiles) {
      // Group files by fileType
      const filesByType = {};
      
      for (const file of content.files) {
        if (!filesByType[file.fileType]) {
          filesByType[file.fileType] = [];
        }
        filesByType[file.fileType].push(file);
      }

      // For each file type, keep only the most recent file and delete the rest
      for (const [fileType, files] of Object.entries(filesByType)) {
        if (files.length > 1) {
          // Sort by uploadedAt (most recent first)
          files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
          
          // Keep the first (most recent) file, delete the rest
          const filesToDelete = files.slice(1);
          
      
          
          for (const fileToDelete of filesToDelete) {
            await prisma.contentFile.delete({
              where: { id: fileToDelete.id },
            });
            totalDeleted++;
           
          }
        }
      }
    }

   
    
  } catch (error) {
   
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicateFiles();
