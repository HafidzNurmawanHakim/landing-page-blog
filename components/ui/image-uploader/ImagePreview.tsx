"use client";

import { Crop, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadedImage } from "./_types";

// Image Preview Component
interface ImagePreviewProps {
	image: UploadedImage;
	onRemove: () => void;
	onCrop?: () => void;
	showCropButton?: boolean;
	isUploading?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
	image,
	onRemove,
	onCrop,
	showCropButton = false,
	isUploading = false,
}) => {
	return (
		<div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-foreground/30">
			<div className="relative aspect-square">
				{/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview */}
				<img
					src={image.url}
					alt={image.fileName}
					className="h-full w-full object-cover"
				/>
				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50">
						<Loader2 className="h-8 w-8 animate-spin text-white" />
					</div>
				)}
				<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-all duration-200 group-hover:bg-black/30">
					{showCropButton && (
						<Button
							size="sm"
							variant="secondary"
							onClick={onCrop}
							className="rounded-full opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Crop className="h-4 w-4" />
						</Button>
					)}
					<Button
						size="sm"
						variant="destructive"
						onClick={onRemove}
						className="rounded-full opacity-0 transition-opacity group-hover:opacity-100"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<div className="p-2">
				<p className="truncate text-sm font-medium">{image.fileName}</p>
				<p className="text-xs text-muted-foreground">
					{(image.size / 1024 / 1024).toFixed(2)} MB
				</p>
			</div>
		</div>
	);
};

export default ImagePreview;
