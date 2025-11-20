import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeClassSubjectLinks() {
  console.log('🔄 Removing class-to-subject links...\n');

  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      schoolId: true,
      subjects: {
        select: { id: true, name: true },
      },
    },
  });

  let totalDisconnects = 0;

  for (const classItem of classes) {
    if (!classItem.subjects.length) {
      continue;
    }

    console.log(
      `🏫 School ${classItem.schoolId} | Class ${classItem.name} (${classItem.id}) has ${classItem.subjects.length} linked subject(s). Disconnecting...`,
    );

    await prisma.class.update({
      where: { id: classItem.id },
      data: {
        subjects: {
          set: [],
        },
      },
    });

    totalDisconnects += classItem.subjects.length;
  }

  console.log(
    totalDisconnects > 0
      ? `\n✅ Removed ${totalDisconnects} class-to-subject link(s) across ${classes.length} class records.`
      : '\n✅ No class-to-subject links found. Nothing to remove.',
  );
}

removeClassSubjectLinks()
  .catch((error) => {
    console.error('❌ Error while removing class subject links:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

