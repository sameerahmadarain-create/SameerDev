import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigDiagnostics {
  configured: boolean;
  missingVars: string[];
  error: string | null;
  urlHost: string | null;
}

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

function isServiceRoleOrSecretKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as { role?: string };
      if (payload?.role === 'service_role') {
        return true;
      }
    } catch {
      // Non-JWT or unreadable token format; ignore decode check
    }
  }
  return false;
}

function evaluateSupabaseConfig(): SupabaseConfigDiagnostics {
  const missingVars: string[] = [];

  const urlIsPlaceholder = !rawUrl || rawUrl.includes('YOUR_PROJECT_ID');
  const keyIsPlaceholder = !rawAnonKey || rawAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

  if (urlIsPlaceholder) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  if (keyIsPlaceholder) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    return {
      configured: false,
      missingVars,
      error: `Supabase configuration is missing at build time (${missingVars.join(', ')}). Configure these as Build Environment Variables in Cloudflare and redeploy.`,
      urlHost: null,
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== 'https:') {
      return {
        configured: false,
        missingVars: [],
        error: 'VITE_SUPABASE_URL must be a valid https:// URL.',
        urlHost: null,
      };
    }
  } catch {
    return {
      configured: false,
      missingVars: [],
      error: 'VITE_SUPABASE_URL is not a valid URL.',
      urlHost: null,
    };
  }

  if (isServiceRoleOrSecretKey(rawAnonKey)) {
    return {
      configured: false,
      missingVars: [],
      error:
        'Security error: A Supabase service_role or secret key was provided to the frontend. Use only the public anon key in VITE_SUPABASE_ANON_KEY.',
      urlHost: parsedUrl.hostname,
    };
  }

  return {
    configured: true,
    missingVars: [],
    error: null,
    urlHost: parsedUrl.hostname,
  };
}

const configDiagnostics = evaluateSupabaseConfig();

export const supabase: SupabaseClient | null = configDiagnostics.configured
  ? createClient(rawUrl, rawAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export function getSupabaseConfigDiagnostics(): SupabaseConfigDiagnostics {
  return configDiagnostics;
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
