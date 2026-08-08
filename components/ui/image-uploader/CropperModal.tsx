"use client";

import { useCallback, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/utils/compressor";
import { UploadedImage } from "./_types";

// Cropper Component
interface CropperModalProps {
	image: UploadedImage;
	aspectRatio: number;
	onComplete: (croppedImage: UploadedImage) => void;
	onCancel: () => void;
}

const CropperModal: React.FC<CropperModalProps> = ({
	image,
	aspectRatio,
	onComplete,
	onCancel,
}) => {
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState<Area | null>(null);
	const [loading, setLoading] = useState(false);

	const onCropComplete = useCallback(
		(croppedArea: Area, croppedAreaPixels: Area) => {
			setCroppedArea(croppedAreaPixels);
		},
		[],
	);

	const handleSave = async () => {
		if (!croppedArea) return;

		try {
			setLoading(true);
			const croppedImageUrl = await getCroppedImg(
				image.url,
				croppedArea,
				1,
				image.type,
			);

			// Convert data URL to File
			const response = await fetch(croppedImageUrl);
			const blob = await response.blob();
			const file = new File([blob], image.fileName, { type: image.type });

			const croppedImage: UploadedImage = {
				...image,
				url: croppedImageUrl,
				file,
				size: file.size,
			};

			onComplete(croppedImage);
		} catch (error) {
			toast.error("Gagal memotong gambar");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="relative h-96 w-full overflow-hidden rounded-2xl">
				<Cropper
					image={image.url}
					crop={crop}
					zoom={zoom}
					aspect={aspectRatio}
					onCropChange={setCrop}
					onZoomChange={setZoom}
					onCropComplete={onCropComplete}
					showGrid
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={onCancel}
					className="rounded-full"
				>
					Batal
				</Button>
				<Button
					onClick={handleSave}
					disabled={loading}
					className="rounded-full"
				>
					{loading ? "Memotong..." : "Terapkan Potongan"}
				</Button>
			</div>
		</div>
	);
};

export default CropperModal;
