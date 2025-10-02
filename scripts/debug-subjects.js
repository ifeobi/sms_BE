const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSubjects() {
  try {
    console.log('🔍 DEBUGGING SUBJECTS ISSUE\n');
    
    // Get the school ID (looking for Jade Academy)
    const school = await prisma.school.findFirst({
      where: { name: { contains: 'Jade', mode: 'insensitive' } }
    });
    if (!school) {
      console.log('❌ Jade Academy not found, checking all schools...');
      const allSchools = await prisma.school.findMany();
      console.log('Available schools:');
      allSchools.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));
      return;
    }
    
    console.log(`📚 School: ${school.name} (ID: ${school.id})\n`);
    
    // Check levels
    const levels = await prisma.level.findMany({
      where: { schoolId: school.id },
      include: { classes: true }
    });
    
    console.log('📊 LEVELS:');
    levels.forEach(level => {
      console.log(`  - ${level.name} (Active: ${level.isActive}) - Classes: ${level.classes.length}`);
    });
    console.log('');
    
    // Check classes
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      include: { level: true, subjects: true }
    });
    
    console.log('🏫 CLASSES:');
    classes.forEach(cls => {
      console.log(`  - ${cls.name} (Level: ${cls.level.name}, Active: ${cls.level.isActive}) - Subjects: ${cls.subjects.length}`);
    });
    console.log('');
    
    // Check subjects - OLD WAY
    const allSubjects = await prisma.subject.findMany({
      where: { schoolId: school.id, isActive: true }
    });
    
    console.log('📚 ALL SUBJECTS (old query):');
    allSubjects.forEach(subject => {
      console.log(`  - ${subject.name} (Active: ${subject.isActive})`);
    });
    console.log('');
    
    // Check subjects - NEW WAY (with active level filter)
    const filteredSubjects = await prisma.subject.findMany({
      where: { 
        schoolId: school.id, 
        isActive: true,
        classes: {
          some: {
            level: {
              isActive: true
            }
          }
        }
      }
    });
    
    console.log('📚 FILTERED SUBJECTS (new query):');
    filteredSubjects.forEach(subject => {
      console.log(`  - ${subject.name} (Active: ${subject.isActive})`);
    });
    console.log('');
    
    // Check if subjects have class relationships
    const subjectsWithClasses = await prisma.subject.findMany({
      where: { schoolId: school.id },
      include: { classes: { include: { level: true } } }
    });
    
    console.log('🔗 SUBJECT-CLASS RELATIONSHIPS:');
    subjectsWithClasses.forEach(subject => {
      console.log(`  - ${subject.name}:`);
      subject.classes.forEach(cls => {
        console.log(`    └─ Class: ${cls.name} (Level: ${cls.level.name}, Level Active: ${cls.level.isActive})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSubjects();
