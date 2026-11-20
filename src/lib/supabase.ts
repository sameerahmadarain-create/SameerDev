import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('YOUR_PROJECT_ID') ||
  supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

export const supabase: SupabaseClient | null = !isPlaceholder
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Uploads a compressed base64 data URL to Supabase Storage ('product-images' bucket).
 * Returns the public URL on success, or null if storage upload is not permitted/fails.
 */
export async function uploadImageToSupabaseStorage(
  dataUrl: string,
  fileSlug: string
): Promise<string | null> {
  if (!supabase || !dataUrl.startsWith('data:image/')) {
    return null;
  }

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
    const filePath = `${fileSlug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload skipped, falling back to inline image:', uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('Supabase storage upload failed, falling back to inline image:', err);
    return null;
  }
}
