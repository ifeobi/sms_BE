# Video Integration with ImageKit - Complete Guide

## 🎯 Overview

This guide covers the complete integration of ImageKit for video content in your School Management System. The integration allows content creators to upload, manage, and sell video content with automatic optimization and global CDN delivery.

## 🏗️ Architecture

### Backend (NestJS)
- **ImageKit Service**: Handles video uploads, transformations, and URL generation
- **Video Upload Controller**: API endpoints for video management
- **Webhook Controller**: Handles ImageKit notifications
- **Database Schema**: Extended to support video metadata

### Frontend (Next.js + Redux)
- **VideoUpload Component**: Creator video upload interface
- **VideoPlayer Component**: Optimized video playback
- **VideoThumbnail Component**: Video preview cards
- **VideoMarketplace Component**: Video browsing and search
- **Redux Integration**: State management for video operations

## 🚀 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd sms_BE
npm install imagekit
```

#### Environment Variables
Add to your `.env` file:
```bash
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-imagekit-id"
```

#### Database Migration
```bash
# Run the migration to add ImageKit support
npx prisma migrate dev --name add-imagekit-video-support
npx prisma generate
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd sms_FE
npm install @mui/icons-material
```

#### Redux Integration
The video Redux slice is already integrated into your store.

### 3. ImageKit Dashboard Setup

1. **Create ImageKit Account**: Go to [imagekit.io](https://imagekit.io)
2. **Get Credentials**: 
   - Public Key: Dashboard → Developer Options
   - Private Key: Dashboard → Developer Options  
   - URL Endpoint: Dashboard → URL Endpoint
3. **Configure Webhooks**:
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/webhooks/imagekit/video-upload`
   - Select events: "File Uploaded", "File Updated", "File Deleted"
4. **Video Settings**:
   - Enable video optimization
   - Set up automatic thumbnail generation
   - Configure video formats (MP4, WebM, etc.)

## 📡 API Endpoints

### Video Upload
- `POST /upload/video/request-url` - Get secure upload URL
- `POST /upload/video/webhook` - Handle ImageKit webhooks
- `GET /upload/video/:fileId/url` - Get optimized video URL
- `GET /upload/video/:fileId/thumbnail` - Get video thumbnail
- `GET /upload/video/:fileId/thumbnails` - Get multiple thumbnails
- `GET /upload/video/:fileId/stream` - Get adaptive streaming URL
- `DELETE /upload/video/:fileId` - Delete video

### Video Management
- `GET /api/content/video/:id` - Get video details
- `POST /api/content/video` - Save video details
- `PUT /api/content/video/:id` - Update video
- `DELETE /api/content/video/:id` - Delete video
- `GET /api/marketplace/videos` - Search videos
- `GET /api/creator/:id/videos` - Get creator's videos

## 🎬 Frontend Components

### VideoUpload Component
```tsx
import VideoUpload from '@/components/VideoUpload';

<VideoUpload
  onUploadComplete={(videoData) => {
    // Handle upload completion
  }}
  contentId="content_123"
  maxFileSize={500} // 500MB
  allowedFormats={['.mp4', '.mov', '.avi']}
/>
```

### VideoPlayer Component
```tsx
import VideoPlayer from '@/components/VideoPlayer';

<VideoPlayer
  videoId="video_123"
  title="My Video"
  description="Video description"
  thumbnailUrl="https://..."
  duration={120}
  creator={{ id: "creator_1", name: "John Doe" }}
  price={1000}
  isPurchased={true}
  quality="medium"
  autoplay={false}
  controls={true}
/>
```

### VideoMarketplace Component
```tsx
import VideoMarketplace from '@/components/VideoMarketplace';

<VideoMarketplace
  onVideoSelect={(video) => {
    // Handle video selection
  }}
  onPurchase={(video) => {
    // Handle purchase
  }}
  showFilters={true}
  showSearch={true}
  maxVideos={20}
/>
```

## 🔄 Redux Integration

### Actions
```typescript
import { useDispatch } from 'react-redux';
import {
  fetchVideos,
  fetchVideoById,
  requestVideoUploadUrl,
  uploadVideoToImageKit,
  saveVideoDetails,
  completeVideoUpload,
  toggleVideoLike,
  toggleVideoBookmark,
} from '@/redux/actions/video/videoActions';

const dispatch = useDispatch();

// Fetch videos
dispatch(fetchVideos({ category: 'VIDEO_COURSE', page: 1 }));

// Upload video
dispatch(completeVideoUpload(videoData, file));

// Like video
dispatch(toggleVideoLike(videoId));
```

### State Access
```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const { videos, loading, error, uploadProgress } = useSelector(
  (state: RootState) => state.video
);
```

## 🎥 Video Upload Flow

### 1. Creator Upload Process
1. Creator selects video file
2. Frontend validates file (size, format)
3. Backend generates secure upload URL
4. Frontend uploads directly to ImageKit
5. ImageKit processes and optimizes video
6. Webhook notifies backend of completion
7. Backend saves video metadata to database
8. Video appears in marketplace

### 2. Customer Viewing Process
1. Customer browses video marketplace
2. Clicks on video thumbnail
3. Frontend requests optimized video URL
4. Video plays with adaptive quality
5. Customer can purchase if not owned

## 🔧 Configuration Options

### Video Quality Settings
- **Low**: 640p, 60% quality
- **Medium**: 1280p, 80% quality  
- **High**: 1920p, 90% quality

### Supported Formats
- MP4, MOV, AVI, MKV, WebM, M4V

### File Size Limits
- Maximum: 500MB per video
- Configurable in component props

## 🛡️ Security Features

- **Secure Upload URLs**: Time-limited, authenticated
- **Access Control**: User authentication required
- **File Validation**: Size and format restrictions
- **Private Videos**: Access controlled by your platform
- **Watermarking**: Optional for premium content

## 📊 Analytics & Monitoring

### Video Analytics
- View count tracking
- Like/share metrics
- Purchase analytics
- Revenue tracking
- Performance monitoring

### Error Handling
- Upload failure recovery
- Processing error notifications
- Network timeout handling
- User-friendly error messages

## 🧪 Testing

### Backend Testing
```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/webhooks/imagekit/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test video upload URL
curl -X POST http://localhost:3001/upload/video/request-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"filename": "test.mp4", "fileSize": 1000000, "creatorId": "creator_123"}'
```

### Frontend Testing
1. Test video upload component
2. Test video player functionality
3. Test marketplace browsing
4. Test Redux state management

## 🚀 Deployment

### Production Checklist
- [ ] ImageKit credentials configured
- [ ] Webhook URLs updated
- [ ] Database migration applied
- [ ] CDN configuration verified
- [ ] Error monitoring enabled
- [ ] Performance monitoring active

### Environment Variables (Production)
```bash
IMAGEKIT_PUBLIC_KEY="pk_prod_..."
IMAGEKIT_PRIVATE_KEY="sk_prod_..."
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"
```

## 📈 Performance Benefits

- **Global CDN**: Fast video delivery worldwide
- **Automatic Optimization**: Multiple formats and qualities
- **Adaptive Streaming**: Quality based on connection
- **Thumbnail Generation**: Auto-created previews
- **Mobile Optimization**: Responsive video delivery

## 🔍 Troubleshooting

### Common Issues
1. **Upload Fails**: Check file size and format
2. **Video Not Processing**: Verify webhook configuration
3. **Slow Loading**: Check CDN settings
4. **Authentication Errors**: Verify ImageKit credentials

### Debug Mode
Enable detailed logging in development:
```typescript
// In ImageKit service
console.log('Upload URL generated:', uploadData);
console.log('Webhook received:', webhookData);
```

## 📚 Additional Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [Video Optimization Guide](https://docs.imagekit.io/video-optimization)
- [Webhook Configuration](https://docs.imagekit.io/webhooks)
- [CDN Performance](https://docs.imagekit.io/cdn-performance)

## ✅ Integration Complete

Your video integration is now complete! Content creators can upload videos, and customers can browse and purchase them with optimized delivery through ImageKit's global CDN.
