# ImageKit Setup Instructions

## 1. Create ImageKit Account

1. Go to [imagekit.io](https://imagekit.io) and sign up for a free account
2. Complete the account setup process

## 2. Get Your ImageKit Credentials

1. **Login to ImageKit Dashboard**
2. **Go to Developer Options** (in the left sidebar)
3. **Copy your credentials:**
   - **Public Key**: Copy the public key
   - **Private Key**: Copy the private key
   - **URL Endpoint**: Copy the URL endpoint (looks like `https://ik.imagekit.io/your-id`)

## 3. Configure Environment Variables

Create a `.env` file in the `sms_BE` directory with the following variables:

```bash
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-imagekit-id"

# Other required variables
DATABASE_URL="postgresql://username:password@localhost:5432/sms_db"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

## 4. Install ImageKit Package

Make sure the ImageKit package is installed:

```bash
cd sms_BE
npm install imagekit
```

## 5. Test the Integration

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Check the console logs** - you should see:
   ```
   ImageKit Config Debug:
   Public Key: SET
   Private Key: SET
   URL Endpoint: SET
   ✅ ImageKit initialized successfully
   ```

3. **Test file upload** through the creator dashboard

## 6. ImageKit Dashboard Configuration

### Configure Webhooks (Optional)
1. Go to ImageKit Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/upload/video/webhook`
3. Select events: "File Uploaded", "File Updated", "File Deleted"

### Configure Transformations (Optional)
1. Go to ImageKit Dashboard → Settings → Transformations
2. Set up image optimization settings
3. Configure video processing options

## 7. Benefits of ImageKit Integration

- **Global CDN**: Fast file delivery worldwide
- **Automatic Optimization**: Images and videos are optimized automatically
- **Transformations**: On-the-fly image resizing and optimization
- **Video Processing**: Automatic thumbnail generation
- **Scalability**: No server storage limitations
- **Security**: Secure file access and management

## 8. Troubleshooting

### Common Issues:

1. **"ImageKit not initialized" error:**
   - Check that all environment variables are set correctly
   - Verify the credentials in your ImageKit dashboard

2. **Upload failures:**
   - Check your ImageKit account limits
   - Verify the file size limits (500MB for videos)

3. **File not found errors:**
   - Ensure the ImageKit URL endpoint is correct
   - Check that files are being uploaded successfully

### Debug Steps:

1. Check the backend console for ImageKit initialization messages
2. Verify environment variables are loaded correctly
3. Test with a small image file first
4. Check ImageKit dashboard for uploaded files

## 9. Production Considerations

- **Set up proper webhooks** for production
- **Configure CORS** for your production domain
- **Set up monitoring** for upload failures
- **Configure backup strategies** for critical files
- **Set up proper error handling** for failed uploads
