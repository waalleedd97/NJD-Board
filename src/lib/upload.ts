import { supabase } from './supabase';

const BUCKET = 'attachments';

/**
 * Upload a file to Supabase Storage on the AUTH project (has user session).
 * Path includes userId for ownership verification in storage policies.
 */
export async function uploadFile(
  file: File,
  folder: string,
  userId: string
): Promise<{ url: string; name: string; size: number } | null> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error('Upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, size: file.size };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
