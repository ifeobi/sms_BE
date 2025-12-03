import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCAScoresToJSON() {
  console.log('Starting CA scores migration to JSON format...');

  try {
    // Get all unique student/subject/class/term combinations
    const uniqueCombinations = await prisma.$queryRaw<Array<{
      studentId: string;
      subjectId: string;
      classId: string;
      termId: string;
    }>>`
      SELECT DISTINCT "studentId", "subjectId", "classId", "termId"
      FROM "ca_component_grades"
    `;

    console.log(`Found ${uniqueCombinations.length} unique combinations to migrate`);

    for (const combo of uniqueCombinations) {
      // Get all records for this combination
      const records = await prisma.$queryRaw<Array<{
        id: string;
        componentType: string;
        score: number | null;
        grade: string | null;
      }>>`
        SELECT "id", "componentType", "score", "grade"
        FROM "ca_component_grades"
        WHERE "studentId" = ${combo.studentId}
          AND "subjectId" = ${combo.subjectId}
          AND "classId" = ${combo.classId}
          AND "termId" = ${combo.termId}
          AND "isActive" = true
      `;

      if (records.length === 0) continue;

      // Build JSON object
      const caScores: Record<string, number> = {};
      let overallGrade: string | null = null;

      for (const record of records) {
        if (record.componentType === 'EXAM') {
          if (record.score !== null) {
            caScores['EXAM'] = record.score;
          }
          if (record.grade) {
            overallGrade = record.grade;
          }
        } else if (record.componentType.match(/^CA\d+$/i)) {
          if (record.score !== null) {
            caScores[record.componentType.toUpperCase()] = record.score;
          }
        }
      }

      // Update the first record with JSON and delete others
      if (records.length > 0) {
        const firstRecordId = records[0].id;

        // Update first record
        await prisma.$executeRaw`
          UPDATE "ca_component_grades"
          SET "caScores" = ${JSON.stringify(caScores)}::jsonb,
              "grade" = COALESCE(${overallGrade}, "grade")
          WHERE "id" = ${firstRecordId}
        `;

        // Delete duplicate records
        if (records.length > 1) {
          const duplicateIds = records.slice(1).map(r => r.id);
          await prisma.$executeRaw`
            DELETE FROM "ca_component_grades"
            WHERE "id" = ANY(${duplicateIds}::text[])
          `;
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCAScoresToJSON();

