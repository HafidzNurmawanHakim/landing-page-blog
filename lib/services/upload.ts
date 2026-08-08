/**
 * Upload a file to the product image endpoint.
 * POST /api/admin/media/upload → { data: { url } }
 */
export type UploadedMedia = { url: string };

export async function uploadFile(file: File): Promise<UploadedMedia> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch("/api/admin/media/upload", {
		method: "POST",
		body: formData,
	});

	const json = (await res.json().catch(() => null)) as
		| { data?: { url?: string }; error?: string }
		| null;

	if (!res.ok || !json?.data?.url) {
		const message = json?.error ?? "Gagal upload gambar.";
		if (res.status === 401 || res.status === 403) {
			throw new Error("Sesi berakhir. Silakan login ulang.");
		}
		throw new Error(message);
	}

	return { url: json.data.url };
}
