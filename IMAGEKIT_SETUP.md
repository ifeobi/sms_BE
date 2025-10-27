# ImageKit Integration Setup Guide

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-imagekit-id"
```

## How to Get ImageKit Credentials

1. **Sign up for ImageKit**: Go to [imagekit.io](https://imagekit.io) and create an account
2. **Get your credentials**:
   - **Public Key**: Found in your ImageKit dashboard under "Developer Options"
   - **Private Key**: Found in your ImageKit dashboard under "Developer Options"
   - **URL Endpoint**: Found in your ImageKit dashboard under "URL Endpoint"

## Database Migration

After updating the schema, run the migration:

```bash
npx prisma migrate dev --name add-imagekit-video-support
npx prisma generate
```

## ImageKit Dashboard Setup

1. **Configure Webhooks**:
   - Go to ImageKit Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/upload/video/webhook`
   - Select events: "File Uploaded", "File Updated", "File Deleted"

2. **Configure Video Processing**:
   - Go to ImageKit Dashboard → Settings → Video
   - Enable video optimization
   - Set up automatic thumbnail generation
   - Configure video formats (MP4, WebM, etc.)

## Testing the Integration

1. **Start your backend server**:
   ```bash
   npm run dev
   ```

2. **Test video upload**:
   - Use the `/upload/video/request-url` endpoint
   - Upload a video file to the returned URL
   - Check if webhook is received

## API Endpoints Added

- `POST /upload/video/request-url` - Get secure upload URL
- `POST /upload/video/webhook` - Handle ImageKit webhooks
- `GET /upload/video/:fileId/url` - Get optimized video URL
- `GET /upload/video/:fileId/thumbnail` - Get video thumbnail
- `GET /upload/video/:fileId/thumbnails` - Get multiple thumbnails
- `GET /upload/video/:fileId/stream` - Get adaptive streaming URL
- `DELETE /upload/video/:fileId` - Delete video

## Frontend Integration

The frontend will need to:
1. Request upload URL from backend
2. Upload video directly to ImageKit
3. Handle upload progress
4. Display video with optimized URLs
5. Show thumbnails and video player

## Security Notes

- Upload URLs are time-limited (expire in minutes)
- Only authenticated users can request upload URLs
- Video access is controlled by your platform
- ImageKit URLs can be made private/restricted
