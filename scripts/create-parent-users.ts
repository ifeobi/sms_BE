const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createParentUsers() {
  try {
    console.log('Creating parent test users...');
    console.log('========================================');

    // Parent users to create (matching frontend dummy data)
    const parentUsers = [
      {
        email: 'parent1@example.com',
        firstName: 'Mr. Olumide',
        lastName: 'Adesanya',
        profilePicture: '/images/avatars/parent-1.jpg',
      },
      {
        email: 'parent2@example.com',
        firstName: 'Mrs. Funmi',
        lastName: 'Bakare',
        profilePicture: '/images/avatars/parent-2.jpg',
      },
      {
        email: 'parent3@example.com',
        firstName: 'Dr. James',
        lastName: 'Peterson',
        profilePicture: '/images/avatars/parent-3.jpg',
      },
    ];

    // Hash the password (same for all test users)
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const parentData of parentUsers) {
      // Check if parent already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          email: parentData.email,
          type: 'PARENT',
        },
      });

      if (existingUser) {
        console.log(`⚠️  Parent already exists: ${parentData.email}`);
        continue;
      }

      // Create parent user
      const user = await prisma.user.create({
        data: {
          email: parentData.email,
          password: hashedPassword,
          type: 'PARENT',
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          profilePicture: parentData.profilePicture,
          isActive: true,
        },
      });

      // Create parent profile
      await prisma.parent.create({
        data: {
          userId: user.id,
          isActive: true,
        },
      });

      console.log(`✅ Created parent: ${parentData.email}`);
    }

    console.log('========================================');
    console.log('✅ All parent test users created successfully!');
    console.log('========================================');
    console.log('Login credentials for all parents:');
    console.log('Email: parent1@example.com | Password: password123');
    console.log('Email: parent2@example.com | Password: password123');
    console.log('Email: parent3@example.com | Password: password123');
    console.log('User Type: PARENT');
    console.log('========================================');
    console.log('You can now login with these credentials!');
  } catch (error) {
    console.error('❌ Error creating parent users:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createParentUsers();

export {};

