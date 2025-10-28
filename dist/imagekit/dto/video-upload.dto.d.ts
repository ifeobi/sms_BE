export declare class VideoUploadRequestDto {
    filename: string;
    fileSize: number;
    creatorId: string;
    contentId?: string;
    title?: string;
    description?: string;
}
export declare class VideoUploadResponseDto {
    uploadUrl: string;
    fileId: string;
    signature: string;
    token: string;
    expire: number;
    filePath: string;
}
export declare class VideoTransformDto {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
}
export declare class VideoThumbnailDto {
    timeInSeconds: number;
    width?: number;
    height?: number;
}
