/**
 * Cloudinary integration for file storage.
 * Stores: Profile Photos, PDFs, DOCX, PPTX, TXT, Meeting Files, Resumes
 * Never stores files in MongoDB — only metadata (fileName, publicId, secureUrl, userId)
 */

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  originalFilename: string;
  folder: string;
}

export const CLOUDINARY_FOLDERS = {
  avatars:      'nexus-ai/avatars',
  documents:    'nexus-ai/documents',
  resumes:      'nexus-ai/resumes',
  meetings:     'nexus-ai/meetings',
  knowledgeVault: 'nexus-ai/knowledge-vault',
} as const;

function buildSignature(params: Record<string, string>, apiSecret: string): string {
  // Sort params and build signature string
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  // In production use crypto.createHash — this is the shape
  return sorted + apiSecret;
}

export async function uploadToCloudinary(
  file: File,
  folder: keyof typeof CLOUDINARY_FOLDERS,
  userId: string
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folderPath = CLOUDINARY_FOLDERS[folder];
  const publicId   = `${folderPath}/${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folderPath);
  formData.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${err.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return {
    publicId:         data.public_id,
    secureUrl:        data.secure_url,
    format:           data.format,
    bytes:            data.bytes,
    originalFilename: data.original_filename,
    folder:           folderPath,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: formData,
  });
}
