const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkParentUser() {
  try {
    console.log('🔍 Checking parent user in database...\n');
    
    const email = 'winnerkosiso2@gmail.com';
    const userType = 'PARENT';
    
    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email_type: {
          email: email,
          type: userType
        }
      },
      include: {
        parent: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Type:', user.type);
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Is Active:', user.isActive);
    console.log('Created At:', user.createdAt);
    console.log('');
    
    // Check if parent relationship exists
    if (user.parent) {
      console.log('✅ Parent relationship exists:');
      console.log('Parent ID:', user.parent.id);
      console.log('Parent Active:', user.parent.isActive);
    } else {
      console.log('❌ Parent relationship MISSING!');
      console.log('This is the problem - User exists but Parent record does not.');
    }
    console.log('');
    
    // Test password
    const testPassword = 'password123';
    console.log('🔑 Testing password...');
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password matches "password123":', passwordMatch);
    
    if (!passwordMatch) {
      console.log('');
      console.log('⚠️  The password in the database does NOT match "password123"');
      console.log('You may need to reset the password or use a different one.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkParentUser();

