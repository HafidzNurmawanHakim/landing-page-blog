"use client";

import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ImageUploadConfig,
	ImageUploadModalProps,
	ImageUploadModalRef,
	UploadedImage,
} from "./_types";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/utils/compressor";
import { uploadFile } from "@/lib/services/upload";
import CropperModal from "./CropperModal";
import { Check, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import ImagePreview from "./ImagePreview";
import { Button } from "@/components/ui/button";
import ModalDrawer, {
	ReusableModalRef,
} from "@/components/ui/modal-drawer";
import { generateImageId } from "@/lib/utils/image";

const defaultConfig: ImageUploadConfig = {
	maxFiles: 5,
	maxFileSize: 5, // 5MB
	acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
	enableCrop: true,
	cropAspectRatio: 1,
	enableCompression: true,
	compressionOptions: {
		targetMaxSizeKB: 500,
		maxWidth: 1600,
		initialWebPQuality: 0.9,
	},
	enableMultiple: true,
	autoUpload: false,
	deferUpload: false,
};

const ModalImageUploader = forwardRef<
	ImageUploadModalRef,
	ImageUploadModalProps
>(
	(
		{
			title = "Upload Images",
			description = "Select images to upload",
			config = defaultConfig,
			onUploadComplete,
			onSelectionComplete,
			onUploadProgress,
			onError,
			className,
			defaultImages = [],
		},
		ref,
	) => {
		const [images, setImages] = useState<UploadedImage[]>(defaultImages);
		const [cropImage, setCropImage] = useState<UploadedImage | null>(null);
		const [uploading, setUploading] = useState(false);
		const [uploadProgress, setUploadProgress] = useState(0);
		const fileInputRef = useRef<HTMLInputElement>(null);
		const modalRef = useRef<ReusableModalRef>(null);

		const mergedConfig = useMemo(
			() => ({ ...defaultConfig, ...config }),
			[config],
		);

		const uploadImages = useCallback(async (): Promise<
			UploadedImage[] | null
		> => {
			if (images.length === 0) return null;

			setUploading(true);
			setUploadProgress(0);

			try {
				const processedImages: UploadedImage[] = [];

				for (let i = 0; i < images.length; i++) {
					const image = images[i];
					if (!image.file) {
						processedImages.push(image);
						continue;
					}

					let processedFile = image.file;

					if (mergedConfig.enableCompression) {
						processedFile = await compressImage(processedFile, {
							targetMaxSizeKB:
								mergedConfig.compressionOptions
									?.targetMaxSizeKB,
							maxWidth:
								mergedConfig.compressionOptions?.maxWidth,
							initialQuality:
								mergedConfig.compressionOptions
									?.initialWebPQuality,
							onProgress: (progress) => {
								const totalProgress =
									((i + progress / 100) / images.length) *
									100;
								setUploadProgress(totalProgress);
								onUploadProgress?.(totalProgress);
							},
						});
					}

					const response = await uploadFile(processedFile);

					processedImages.push({
						id: generateImageId(),
						url: response.url,
						fileName: image.fileName,
						size: processedFile.size,
						type: processedFile.type,
					});
				}

				if (processedImages.length > 0) {
					onUploadComplete?.(processedImages);
					setUploadProgress(100);
					setCropImage(null);
					setImages([]);
					return processedImages;
				}

				return null;
			} catch (err) {
				console.error(err);
				const errorMessage =
					err instanceof Error ? err.message : "Failed to upload images";
				toast.error(errorMessage);
				onError?.(errorMessage);
				return null;
			} finally {
				setUploading(false);
				setUploadProgress(0);
			}
		}, [
			images,
			mergedConfig.enableCompression,
			mergedConfig.compressionOptions,
			onUploadComplete,
			onUploadProgress,
			onError,
		]);

		useImperativeHandle(ref, () => ({
			open: () => modalRef.current?.open(),
			close: () => modalRef.current?.close(),
			getImages: () => images,
			uploadImages,
			clearImages: () => setImages([]),
		}));

		const handleFileSelect = useCallback(
			(files: FileList | null) => {
				if (!files) return;

				const fileArray = Array.from(files);
				const validFiles: File[] = [];

				// Validate files
				for (const file of fileArray) {
					if (!mergedConfig.acceptedTypes?.includes(file.type)) {
						toast.error(`Tipe file ${file.type} tidak didukung`);
						continue;
					}

					if (
						file.size >
						(mergedConfig.maxFileSize || 5) * 1024 * 1024
					) {
						toast.error(`File ${file.name} terlalu besar`);
						continue;
					}

					validFiles.push(file);
				}

				// Check max files limit
				if (
					images.length + validFiles.length >
					(mergedConfig.maxFiles || 5)
				) {
					toast.error(`Maksimal ${mergedConfig.maxFiles} file`);
					return;
				}

				// Process files
				const newImages: UploadedImage[] = validFiles.map((file) => ({
					id: generateImageId(),
					url: URL.createObjectURL(file),
					fileName: file.name,
					size: file.size,
					type: file.type,
					file,
				}));

				setImages((prev) => [...prev, ...newImages]);
			},
			[images, mergedConfig],
		);

		const handleRemoveImage = (index: number) => {
			setImages((prev) => prev.filter((_, i) => i !== index));
		};

		const handleCropImage = (image: UploadedImage) => {
			setCropImage(image);
		};

		const handleCropComplete = (croppedImage: UploadedImage) => {
			setImages((prev) =>
				prev.map((img) =>
					img.url === cropImage?.url ? croppedImage : img,
				),
			);
			setCropImage(null);
		};

		const handleClear = () => {
			setCropImage(null);
			setImages([]);
		};

		const handleUpload = async () => {
			const uploadedImages = await uploadImages();
			if (uploadedImages) {
				toast.success("Gambar berhasil diupload!");
				modalRef.current?.close();
			}
		};

		const handleConfirmSelection = () => {
			if (images.length === 0) return;
			onSelectionComplete?.(images);
			modalRef.current?.close();
		};

		const handleClose = () => {
			setCropImage(null);
		};

		return (
			<>
				<ModalDrawer
					ref={modalRef}
					title={title}
					className={className}
					onClose={handleClose}
				>
					{(onClose) => (
						<div className="space-y-4 px-4 pb-4">
							<p className="px-1 text-sm text-muted-foreground">
								{description}
							</p>

							{/* File Input */}
							<div className="space-y-2">
								<Input
									ref={fileInputRef}
									type="file"
									accept={mergedConfig.acceptedTypes?.join(
										",",
									)}
									multiple={mergedConfig.enableMultiple}
									onChange={(e) => {
										handleFileSelect(e.target.files);
										e.target.value = "";
									}}
									className="hidden"
								/>

								<div
									className="cursor-pointer rounded-2xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-foreground/30"
									onClick={() =>
										fileInputRef.current?.click()
									}
								>
									<Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
									<p className="text-sm text-foreground">
										Klik untuk memilih gambar atau drag and
										drop
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Maksimal {mergedConfig.maxFiles} file,{" "}
										{mergedConfig.maxFileSize}MB tiap file
									</p>
								</div>
							</div>

							{/* Image Preview */}
							{images.length > 0 && (
								<div className="space-y-2">
									<h3 className="font-medium">
										Gambar Dipilih ({images.length})
									</h3>
									<div className="grid max-h-60 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
										{images.map((image, index) => (
											<ImagePreview
												key={image.id}
												image={image}
												onRemove={() =>
													handleRemoveImage(index)
												}
												onCrop={
													mergedConfig.enableCrop
														? () =>
																handleCropImage(
																	image,
																)
														: undefined
												}
											/>
										))}
									</div>
								</div>
							)}

							{/* Upload Progress */}
							{uploading && (
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>
											Mengupload...{" "}
											{uploadProgress.toFixed(0)}%
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-muted">
										<div
											className="h-2 rounded-full bg-primary transition-all duration-300"
											style={{
												width: `${uploadProgress}%`,
											}}
										/>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex justify-end gap-2 pt-4">
								<Button
									variant="outline"
									onClick={onClose}
									disabled={uploading}
									className="rounded-full"
								>
									Batal
								</Button>
								<Button
									onClick={
										mergedConfig.deferUpload
											? handleConfirmSelection
											: handleUpload
									}
									disabled={images.length === 0 || uploading}
									className="flex items-center gap-2 rounded-full"
								>
									{uploading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Mengupload...
										</>
									) : (
										<>
											<Check className="h-4 w-4" />
											{mergedConfig.deferUpload
												? `Gunakan ${images.length} Gambar${images.length > 1 ? "" : ""}`
												: `Upload ${images.length} Gambar`}
										</>
									)}
								</Button>
							</div>
						</div>
					)}
				</ModalDrawer>

				{/* Cropper Modal */}
				{cropImage && (
					<CropperModal
						image={cropImage}
						aspectRatio={mergedConfig.cropAspectRatio ?? 1}
						onComplete={handleCropComplete}
						onCancel={() => setCropImage(null)}
					/>
				)}
			</>
		);
	},
);

ModalImageUploader.displayName = "ModalImageUploader";

export default ModalImageUploader;
