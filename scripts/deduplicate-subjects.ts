import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deduplicateSubjects() {
  console.log('🔄 Starting subject deduplication...\n');

  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
  });

  for (const school of schools) {
    console.log(`🏫 Processing ${school.name} (${school.id})`);

    const subjects = await prisma.subject.findMany({
      where: { schoolId: school.id },
    });

    const groups = new Map<string, typeof subjects>();
    subjects.forEach((subject) => {
      const key = subject.name.trim().toLowerCase();
      const existing = groups.get(key) ?? [];
      existing.push(subject);
      groups.set(key, existing);
    });

    for (const [nameKey, group] of groups.entries()) {
      if (group.length === 1) continue;

      console.log(`  🔁 Found ${group.length} duplicates for "${nameKey}"`);

      const [primary, ...duplicates] = group.sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
      });

      if (!primary.isActive) {
        await prisma.subject.update({
          where: { id: primary.id },
          data: { isActive: true },
        });
      }

      for (const duplicate of duplicates) {
        console.log(`    ➡️  Merging ${duplicate.id} into ${primary.id}`);

        await prisma.assignment.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: primary.id },
        });

        await prisma.academicRecord.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: primary.id },
        });

        await prisma.teacherAssignment.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: primary.id },
        });

        await prisma.studentSubjectEnrollment.updateMany({
          where: { subjectId: duplicate.id },
          data: { subjectId: primary.id },
        });

        await prisma.subject.update({
          where: { id: duplicate.id },
          data: { isActive: false },
        });
      }
    }
  }

  console.log('\n✅ Subject deduplication complete.');
}

deduplicateSubjects()
  .catch((error) => {
    console.error('❌ Error deduplicating subjects:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



