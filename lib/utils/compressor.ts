import { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";

interface CompressOptions {
	targetMaxSizeKB?: number;
	maxWidth?: number;
	initialQuality?: number;
	onProgress?: (percent: number) => void;
}

/**
 * Production-safe image compression
 * - Resize first
 * - Compress from ORIGINAL
 * - Target size aware
 * - Never increase file size
 */
export async function compressImage(
	file: File,
	options?: CompressOptions
): Promise<File> {
	const {
		targetMaxSizeKB = 500,
		maxWidth = 1600,
		initialQuality = 0.85,
		onProgress,
	} = options ?? {};

	const targetBytes = targetMaxSizeKB * 1024;

	if (file.size <= targetBytes) {
		onProgress?.(100);
		return file;
	}

	onProgress?.(5);

	const compressionOptions = {
		maxSizeMB: targetMaxSizeKB / 1024,
		maxWidthOrHeight: maxWidth,
		useWebWorker: true,
		fileType: "image/webp",
		initialQuality,
		onProgress: (p: number) => {
			// browser-image-compression progress 0–100
			onProgress?.(Math.min(95, Math.round(p)));
		},
	};

	let compressed: File;

	try {
		compressed = await imageCompression(file, compressionOptions);
	} catch (err) {
		console.error("image compression failed:", err);
		return file;
	}

	// HARD SAFETY: size must go down
	if (compressed.size >= file.size) {
		onProgress?.(100);
		return file;
	}

	const output = new File([compressed], replaceExt(file.name, "webp"), {
		type: "image/webp",
		lastModified: Date.now(),
	});

	onProgress?.(100);
	return output;
}

function replaceExt(filename: string, ext: string) {
	return filename.replace(/\.(png|jpg|jpeg|webp)$/i, `.${ext}`);
}

export async function fetchBlobFromURL(url: string) {
	const response = await fetch(url);
	return await response.blob();
}

export function getCroppedImg(
	imageUrl: string,
	crop: Area,
	aspect = 1,
	type = "image/jpeg"
): Promise<string> {
	return new Promise((resolve) => {
		const img = new Image();

		img.src = imageUrl;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				resolve("");
				return;
			}

			// Calculate dimensions of the crop area
			const cropWidth = (img.width * crop.width) / 100;
			const cropHeight = (img.height * crop.height) / 100;

			// Set canvas dimensions based on the desired aspect ratio
			const canvasWidth = cropWidth;
			const canvasHeight = cropWidth / aspect;

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			// Calculate the start position of the crop
			const startX = (img.width * crop.x) / 100;
			const startY = (img.height * crop.y) / 100;

			// Draw the cropped image onto the canvas
			ctx.drawImage(
				img,
				startX,
				startY,
				cropWidth,
				cropHeight,
				0,
				0,
				canvas.width,
				canvas.height
			);

			canvas.toBlob((blob) => {
				if (!blob) {
					resolve("");
					return;
				}
				resolve(URL.createObjectURL(new Blob([blob], { type })));
			}, type);
		};
	});
}
