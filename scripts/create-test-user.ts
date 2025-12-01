const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'admin@test.com',
        type: 'SCHOOL_ADMIN',
      },
    });

    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: admin@test.com');
      console.log('Password: password123');
      console.log('User Type: SCHOOL_ADMIN');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a test school first
    const school = await prisma.school.create({
      data: {
        name: 'Test School',
        type: 'Primary',
        country: 'US',
        city: 'Test City',
        state: 'Test State',
        isActive: true,
      },
    });

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        type: 'SCHOOL_ADMIN',
        firstName: 'Test',
        lastName: 'Admin',
        isActive: true,
      },
    });

    // Create school admin profile
    await prisma.schoolAdmin.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        role: 'principal',
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('----------------------------------------');
    console.log('Email: admin@test.com');
    console.log('Password: password123');
    console.log('User Type: SCHOOL_ADMIN');
    console.log('School: Test School');
    console.log('----------------------------------------');
    console.log('You can now login with these credentials!');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

export {};

