const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubjects() {
  try {
    console.log('🔧 FIXING SUBJECTS FOR EXISTING CLASSES\n');
    
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
    
    // Get education system data
    const config = await prisma.schoolAcademicConfig.findFirst({
      where: { schoolId: school.id }
    });
    
    if (!config) {
      console.log('❌ No academic config found');
      return;
    }
    
    // Use hardcoded education system data for Nigeria
    const educationSystem = {
      systemName: "Nigerian Education System",
      levels: [
        {
          id: "nursery",
          name: "Nursery School",
          classLevels: [
            {
              name: "Nursery 1",
              order: 1,
              subjects: ["Basic Skills", "Social Development"]
            },
            {
              name: "Nursery 2", 
              order: 2,
              subjects: ["Basic Skills", "Social Development"]
            }
          ]
        },
        {
          id: "primary",
          name: "Primary School",
          classLevels: [
            {
              name: "Primary 1",
              order: 1,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            },
            {
              name: "Primary 2",
              order: 2,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            },
            {
              name: "Primary 3",
              order: 3,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            },
            {
              name: "Primary 4",
              order: 4,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            },
            {
              name: "Primary 5",
              order: 5,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            },
            {
              name: "Primary 6",
              order: 6,
              subjects: ["English", "Mathematics", "Social Studies", "Basic Science"]
            }
          ]
        },
        {
          id: "jss",
          name: "Junior Secondary School (JSS)",
          classLevels: [
            {
              name: "JSS 1",
              order: 1,
              subjects: ["English", "Mathematics", "Basic Science", "Social Studies"]
            },
            {
              name: "JSS 2",
              order: 2,
              subjects: ["English", "Mathematics", "Basic Science", "Social Studies"]
            },
            {
              name: "JSS 3",
              order: 3,
              subjects: ["English", "Mathematics", "Basic Science", "Social Studies"]
            }
          ]
        },
        {
          id: "sss",
          name: "Senior Secondary School (SSS)",
          classLevels: [
            {
              name: "SSS 1",
              order: 1,
              subjects: ["English", "Mathematics", "Biology", "Chemistry", "Physics"]
            },
            {
              name: "SSS 2",
              order: 2,
              subjects: ["English", "Mathematics", "Biology", "Chemistry", "Physics"]
            },
            {
              name: "SSS 3",
              order: 3,
              subjects: ["English", "Mathematics", "Biology", "Chemistry", "Physics"]
            }
          ]
        }
      ]
    };
    
    console.log(`🎓 Education System: ${educationSystem.systemName}\n`);
    
    // Get all classes
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      include: { level: true, subjects: true }
    });
    
    console.log(`📊 Found ${classes.length} classes\n`);
    
    for (const classRecord of classes) {
      console.log(`🏫 Processing class: ${classRecord.name} (Level: ${classRecord.level.name})`);
      
      // Find matching level in education system
      const systemLevel = educationSystem.levels.find(
        (l) => l.name.toLowerCase() === classRecord.level.name.toLowerCase()
      );
      
      if (!systemLevel) {
        console.log(`  ⚠️  No matching level found in education system`);
        continue;
      }
      
      // Find matching class in education system
      const systemClass = systemLevel.classLevels.find(
        (c) => c.name.toLowerCase() === classRecord.name.toLowerCase()
      );
      
      if (!systemClass) {
        console.log(`  ⚠️  No matching class found in education system`);
        continue;
      }
      
      console.log(`  📚 Subjects to create: ${systemClass.subjects.join(', ')}`);
      
      // Create subjects for this class
      for (const subjectName of systemClass.subjects) {
        // Check if subject already exists
        const existingSubject = await prisma.subject.findFirst({
          where: {
            schoolId: school.id,
            name: subjectName
          }
        });
        
        let subject;
        if (existingSubject) {
          console.log(`    ✅ Subject "${subjectName}" already exists`);
          subject = existingSubject;
        } else {
          subject = await prisma.subject.create({
            data: {
              name: subjectName,
              code: subjectName.toUpperCase().replace(/\s+/g, '_'),
              description: `${subjectName} for ${classRecord.name}`,
              schoolId: school.id,
              isActive: true,
            },
          });
          console.log(`    ➕ Created subject: "${subjectName}"`);
        }
        
        // Check if subject is already linked to class
        const isLinked = classRecord.subjects.some(s => s.id === subject.id);
        if (!isLinked) {
          await prisma.class.update({
            where: { id: classRecord.id },
            data: {
              subjects: {
                connect: { id: subject.id }
              }
            }
          });
          console.log(`    🔗 Linked subject "${subjectName}" to class "${classRecord.name}"`);
        } else {
          console.log(`    ✅ Subject "${subjectName}" already linked to class`);
        }
      }
      console.log('');
    }
    
    console.log('✅ SUBJECTS FIX COMPLETED\n');
    
    // Verify the fix
    const updatedClasses = await prisma.class.findMany({
      where: { schoolId: school.id },
      include: { level: true, subjects: true }
    });
    
    console.log('📊 VERIFICATION:');
    updatedClasses.forEach(cls => {
      console.log(`  - ${cls.name} (Level: ${cls.level.name}): ${cls.subjects.length} subjects`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubjects();
