import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const ImageKit = require('imagekit');

@Injectable()
export class ImageKitService {
  private imagekit: any;

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');
    
    console.log('ImageKit Config Debug:');
    console.log('Public Key:', publicKey ? 'SET' : 'NOT SET');
    console.log('Private Key:', privateKey ? 'SET' : 'NOT SET');
    console.log('URL Endpoint:', urlEndpoint ? 'SET' : 'NOT SET');
    
    // Only initialize ImageKit if all required environment variables are present
    if (publicKey && privateKey && urlEndpoint) {
      this.imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });
      console.log('✅ ImageKit initialized successfully');
    } else {
      console.log('⚠️ ImageKit not initialized - missing environment variables');
      this.imagekit = null;
    }
  }

  /**
   * Generate secure upload URL for direct video upload to ImageKit
   */
  async generateUploadUrl(
    filename: string,
    fileSize: number,
    creatorId: string,
    contentId?: string,
  ): Promise<{
    uploadUrl: string;
    fileId: string;
    signature: string;
    expire: number;
    token: string;
    filePath: string;
  }> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }
    
    try {
      // Validate file size (max 500MB for videos)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (fileSize > maxSize) {
        throw new BadRequestException('File size exceeds 500MB limit');
      }

      // Validate file extension
      const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
      const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        throw new BadRequestException(
          'Invalid file format. Supported formats: MP4, MOV, AVI, MKV, WebM, M4V',
        );
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filePath = `videos/${creatorId}/${timestamp}-${randomId}-${filename}`;

      // Generate authentication parameters
      const authenticationParameters = this.imagekit.getAuthenticationParameters();

      return {
        uploadUrl: `${this.configService.get<string>('IMAGEKIT_URL_ENDPOINT')}/api/v1/files/upload`,
        fileId: `${timestamp}-${randomId}`,
        signature: authenticationParameters.signature,
        expire: authenticationParameters.expire,
        token: authenticationParameters.token,
        filePath,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Get optimized video URL with transformations
   */
  getOptimizedVideoUrl(
    fileId: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    },
  ): string {
    try {
      let url = `${this.configService.get<string>('IMAGEKIT_URL_ENDPOINT')}/${fileId}`;

      if (transformations) {
        const params = new URLSearchParams();
        
        if (transformations.width) params.append('w', transformations.width.toString());
        if (transformations.height) params.append('h', transformations.height.toString());
        if (transformations.quality) params.append('q', transformations.quality.toString());
        if (transformations.format) params.append('f', transformations.format);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      return url;
    } catch (error) {
      throw new BadRequestException(`Failed to generate video URL: ${error.message}`);
    }
  }

  /**
   * Generate video thumbnail URL
   */
  getVideoThumbnailUrl(fileId: string, timeInSeconds: number = 1): string {
    try {
      return `${this.configService.get<string>('IMAGEKIT_URL_ENDPOINT')}/${fileId}?t=${timeInSeconds}&f=jpg`;
    } catch (error) {
      throw new BadRequestException(`Failed to generate thumbnail URL: ${error.message}`);
    }
  }

  /**
   * Delete video from ImageKit
   */
  async deleteVideo(fileId: string): Promise<boolean> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }
    
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('Failed to delete video from ImageKit:', error);
      return false;
    }
  }

  /**
   * Get video details from ImageKit
   */
  async getVideoDetails(fileId: string): Promise<any> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }
    
    try {
      const details = await this.imagekit.getFileDetails(fileId);
      return details;
    } catch (error) {
      throw new BadRequestException(`Failed to get video details: ${error.message}`);
    }
  }

  /**
   * Generate multiple thumbnail URLs for video preview
   */
  generateVideoThumbnails(fileId: string, count: number = 5): string[] {
    const thumbnails: string[] = [];
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');
    
    for (let i = 0; i < count; i++) {
      const timeInSeconds = (i + 1) * 2; // Every 2 seconds
      thumbnails.push(`${baseUrl}/${fileId}?t=${timeInSeconds}&f=jpg&w=300&h=200`);
    }
    
    return thumbnails;
  }

  /**
   * Get video streaming URL with adaptive quality
   */
  getAdaptiveVideoUrl(fileId: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');
    
    const qualitySettings = {
      low: '?q=60&w=640',
      medium: '?q=80&w=1280', 
      high: '?q=90&w=1920'
    };

    return `${baseUrl}/${fileId}${qualitySettings[quality]}`;
  }

  /**
   * Upload file to ImageKit (for all file types)
   */
  async uploadFile(uploadData: {
    file: Buffer;
    fileName: string;
    folder?: string;
    useUniqueFileName?: boolean;
    tags?: string[];
  }): Promise<{ fileId: string; url: string; name: string }> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }

    try {
      // Build upload parameters - using tags and folder structure for identification
      // DO NOT include customMetadata - ImageKit rejects it
      const uploadParams = {
        file: uploadData.file,
        fileName: uploadData.fileName,
        folder: uploadData.folder || '/',
        useUniqueFileName: uploadData.useUniqueFileName !== undefined ? uploadData.useUniqueFileName : true,
        tags: uploadData.tags || [],
      };

      console.log('📤 Uploading to ImageKit:', {
        fileName: uploadData.fileName,
        folder: uploadParams.folder,
        tags: uploadParams.tags,
        hasCustomMetadata: false, // Explicitly logging that we're NOT sending customMetadata
      });

      const uploadResult = await this.imagekit.upload(uploadParams);

      console.log('✅ ImageKit upload successful:', uploadResult.url);

      return {
        fileId: uploadResult.fileId,
        url: uploadResult.url,
        name: uploadResult.name,
      };
    } catch (error: any) {
      console.error('❌ ImageKit upload error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data || error.response || 'No response data',
        uploadParams: {
          fileName: uploadData.fileName,
          folder: uploadData.folder,
          tags: uploadData.tags,
        }
      });

      // Provide more helpful error messages based on error type
      let errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      
      if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        errorMessage = `Network error: Cannot reach ImageKit servers (${error.hostname || 'upload.imagekit.io'}). Please check your internet connection and DNS settings.`;
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        errorMessage = `Connection refused: ImageKit servers are unreachable. Please check your network connection and firewall settings.`;
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = `Connection timeout: ImageKit servers did not respond in time. Please try again or check your network connection.`;
      }

      throw new BadRequestException(`Failed to upload file to ImageKit: ${errorMessage}`);
    }
  }

  /**
   * Delete file from ImageKit
   */
  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
    }

    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('Failed to delete file from ImageKit:', error);
      return false;
    }
  }
}
