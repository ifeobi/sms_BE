const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubjectClassLinking() {
  try {
    console.log('🔧 FIXING SUBJECT-CLASS LINKING BASED ON DESCRIPTIONS\n');
    
    // Get the school ID (looking for Jade Academy)
    const school = await prisma.school.findFirst({
      where: { name: { contains: 'Jade', mode: 'insensitive' } }
    });
    if (!school) {
      console.log('❌ Jade Academy not found');
      return;
    }
    
    console.log(`📚 School: ${school.name} (ID: ${school.id})\n`);
    
    // Get all subjects for this school
    const subjects = await prisma.subject.findMany({
      where: { schoolId: school.id },
      include: { classes: { include: { level: true } } }
    });
    
    console.log(`📊 Found ${subjects.length} subjects\n`);
    
    // Get all classes for this school
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      include: { level: true, subjects: true }
    });
    
    console.log(`🏫 Found ${classes.length} classes\n`);
    
    // First, remove ALL existing subject-class relationships
    console.log('🧹 Removing all existing subject-class relationships...');
    for (const subject of subjects) {
      await prisma.subject.update({
        where: { id: subject.id },
        data: {
          classes: {
            set: [] // Remove all class relationships
          }
        }
      });
    }
    console.log('✅ All existing relationships removed\n');
    
    // Now link subjects to their correct classes based on descriptions
    console.log('🔗 Linking subjects to correct classes based on descriptions...');
    
    for (const subject of subjects) {
      // Extract class name from description
      // Format: "Subject Name for Class Name" or "Subject Name for Level Class"
      const description = subject.description || '';
      const match = description.match(/for\s+(.+)$/i);
      
      if (match) {
        const targetClass = match[1].trim();
        console.log(`  📝 Subject: ${subject.name} - Looking for class: "${targetClass}"`);
        
        // Find the matching class
        const matchingClass = classes.find(cls => {
          // Try exact match first
          if (cls.name.toLowerCase() === targetClass.toLowerCase()) {
            return true;
          }
          // Try partial match (e.g., "JSS 1" matches "Junior Secondary School (JSS) - JSS 1")
          if (targetClass.toLowerCase().includes(cls.name.toLowerCase()) || 
              cls.name.toLowerCase().includes(targetClass.toLowerCase())) {
            return true;
          }
          return false;
        });
        
        if (matchingClass) {
          // Link subject to the correct class
          await prisma.subject.update({
            where: { id: subject.id },
            data: {
              classes: {
                connect: { id: matchingClass.id }
              }
            }
          });
          console.log(`    ✅ Linked to class: ${matchingClass.name} (Level: ${matchingClass.level.name})`);
        } else {
          console.log(`    ❌ No matching class found for: "${targetClass}"`);
        }
      } else {
        console.log(`  ⚠️  Subject: ${subject.name} - No class info in description: "${description}"`);
      }
    }
    
    console.log('\n✅ SUBJECT-CLASS LINKING FIX COMPLETED\n');
    
    // Verify the fix
    const updatedSubjects = await prisma.subject.findMany({
      where: { schoolId: school.id },
      include: { 
        classes: { 
          include: { level: true } 
        } 
      }
    });
    
    console.log('📊 VERIFICATION:');
    const subjectsByClass = {};
    updatedSubjects.forEach(subject => {
      if (subject.classes.length > 0) {
        subject.classes.forEach(cls => {
          const classKey = `${cls.level.name} - ${cls.name}`;
          if (!subjectsByClass[classKey]) {
            subjectsByClass[classKey] = [];
          }
          subjectsByClass[classKey].push(subject.name);
        });
      } else {
        if (!subjectsByClass['Unassigned']) {
          subjectsByClass['Unassigned'] = [];
        }
        subjectsByClass['Unassigned'].push(subject.name);
      }
    });
    
    Object.entries(subjectsByClass).forEach(([classKey, subjectNames]) => {
      console.log(`  - ${classKey}: ${subjectNames.length} subjects (${subjectNames.join(', ')})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubjectClassLinking();





