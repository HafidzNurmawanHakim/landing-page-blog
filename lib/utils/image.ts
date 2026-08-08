/**
 * Generate a unique ID for uploaded images.
 * e.g. "img_1722041312984_a7f9"
 */
export function generateImageId(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 6);
	return `img_${timestamp}_${random}`;
}
