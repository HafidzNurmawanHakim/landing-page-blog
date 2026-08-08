// Types
export interface UploadedImage {
	id?: string;
	url: string;
	fileName: string;
	size: number;
	type: string;
	file?: File;
}

export interface ImageUploadConfig {
	maxFiles?: number;
	maxFileSize?: number; // in MB
	acceptedTypes?: string[];
	enableCrop?: boolean;
	cropAspectRatio?: number;
	enableCompression?: boolean;
	compressionOptions?: {
		targetMaxSizeKB?: number;
		maxWidth?: number;
		initialWebPQuality?: number;
	};
	enableMultiple?: boolean;
	autoUpload?: boolean;
	deferUpload?: boolean;
}

export interface ImageUploadModalProps {
	title?: string;
	description?: string;
	config?: ImageUploadConfig;
	onUploadComplete?: (images: UploadedImage[]) => void;
	onSelectionComplete?: (images: UploadedImage[]) => void;
	onUploadProgress?: (progress: number) => void;
	onError?: (error: string) => void;
	className?: string;
	defaultImages?: UploadedImage[];
}

export interface ImageUploadModalRef {
	open: () => void;
	close: () => void;
	getImages: () => UploadedImage[];
	uploadImages: () => Promise<UploadedImage[] | null>;
	clearImages: () => void;
}
