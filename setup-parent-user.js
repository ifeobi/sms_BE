const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupParentUser() {
  try {
    console.log('🔍 Setting up parent user...\n');
    
    const parentData = {
      email: 'winnerkosiso2@gmail.com',
      password: 'password123',
      userType: 'PARENT',
      firstName: 'Winner',
      lastName: 'Kosiso',
      phone: '+2348012345678'
    };
    
    console.log('📝 Parent data:');
    console.log(JSON.stringify(parentData, null, 2));
    console.log('');
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: {
        email_type: {
          email: parentData.email,
          type: parentData.userType
        }
      },
      include: {
        parent: true
      }
    });
    
    if (user) {
      console.log('✅ User already exists:', user.id);
      console.log('   Email:', user.email);
      console.log('   Type:', user.type);
      console.log('   Active:', user.isActive);
      console.log('');
      
      // Check password
      const passwordMatch = await bcrypt.compare(parentData.password, user.password);
      console.log('🔑 Password check:', passwordMatch ? '✅ Matches' : '❌ Does NOT match');
      
      if (!passwordMatch) {
        console.log('🔧 Updating password...');
        const hashedPassword = await bcrypt.hash(parentData.password, 10);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
          include: { parent: true }
        });
        console.log('✅ Password updated!');
      }
      console.log('');
      
      // Check if Parent relationship exists
      if (!user.parent) {
        console.log('❌ Parent relationship missing! Creating...');
        await prisma.parent.create({
          data: {
            userId: user.id,
            isActive: true
          }
        });
        console.log('✅ Parent relationship created!');
        
        // Fetch updated user
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { parent: true }
        });
      } else {
        console.log('✅ Parent relationship exists:', user.parent.id);
      }
    } else {
      console.log('❌ User does not exist. Creating...\n');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(parentData.password, 10);
      
      // Create user with parent relationship in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            email: parentData.email,
            password: hashedPassword,
            type: parentData.userType,
            firstName: parentData.firstName,
            lastName: parentData.lastName,
            phone: parentData.phone,
            isActive: true
          }
        });
        
        console.log('✅ User created:', newUser.id);
        
        // Create parent relationship
        const newParent = await tx.parent.create({
          data: {
            userId: newUser.id,
            isActive: true
          }
        });
        
        console.log('✅ Parent relationship created:', newParent.id);
        
        return { user: newUser, parent: newParent };
      });
      
      user = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: { parent: true }
      });
    }
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ PARENT USER SETUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email:', parentData.email);
    console.log('  Password:', parentData.password);
    console.log('  User Type: PARENT');
    console.log('');
    console.log('User ID:', user.id);
    console.log('Parent ID:', user.parent?.id);
    console.log('Active:', user.isActive);
    console.log('');
    console.log('🎉 You can now login to the parent portal!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupParentUser();

