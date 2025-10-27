// Test script to verify ImageKit configuration
const ImageKit = require('imagekit');

// Load environment variables
require('dotenv').config();

console.log('🔍 Testing ImageKit Configuration...\n');

// Check environment variables
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

console.log('Environment Variables:');
console.log('Public Key:', publicKey ? '✅ SET' : '❌ NOT SET');
console.log('Private Key:', privateKey ? '✅ SET' : '❌ NOT SET');
console.log('URL Endpoint:', urlEndpoint ? '✅ SET' : '❌ NOT SET');

if (!publicKey || !privateKey || !urlEndpoint) {
  console.log('\n❌ ImageKit configuration is incomplete!');
  console.log('Please set the following environment variables:');
  console.log('- IMAGEKIT_PUBLIC_KEY');
  console.log('- IMAGEKIT_PRIVATE_KEY');
  console.log('- IMAGEKIT_URL_ENDPOINT');
  process.exit(1);
}

// Test ImageKit initialization
try {
  const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  console.log('\n✅ ImageKit initialized successfully!');
  console.log('Configuration:');
  console.log('- Public Key:', publicKey.substring(0, 10) + '...');
  console.log('- URL Endpoint:', urlEndpoint);

  // Test authentication parameters
  const authParams = imagekit.getAuthenticationParameters();
  console.log('\n✅ Authentication parameters generated successfully!');
  console.log('- Signature:', authParams.signature ? 'Generated' : 'Failed');
  console.log('- Expire:', authParams.expire);
  console.log('- Token:', authParams.token ? 'Generated' : 'Failed');

  console.log('\n🎉 ImageKit is properly configured and ready to use!');
  console.log('\nNext steps:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Test file upload through the creator dashboard');
  console.log('3. Check ImageKit dashboard for uploaded files');

} catch (error) {
  console.log('\n❌ ImageKit initialization failed:');
  console.log('Error:', error.message);
  console.log('\nPlease check your credentials and try again.');
  process.exit(1);
}
