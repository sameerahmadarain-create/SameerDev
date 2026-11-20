export interface ProcessedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB raw file limit
const MAX_DIMENSION = 960; // Keep preview sharp while ensuring compact Firestore storage

/**
 * Compresses and resizes a selected image file in the browser so it can be
 * safely stored in Firestore documents (< 700KB limit) and rendered fast.
 */
export async function processImageFile(file: File): Promise<ProcessedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (PNG, JPG, WebP, or GIF).');
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Image file is too large. Please select an image under 10 MB.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Selected file is not a readable image.'));
    image.src = rawDataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Browser canvas is unavailable for image processing.');
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Try progressively lighter quality if needed to stay safely within Firestore limits
  const qualities = [0.82, 0.7, 0.55];
  let finalDataUrl = canvas.toDataURL('image/jpeg', qualities[0]);

  for (const q of qualities) {
    finalDataUrl = canvas.toDataURL('image/jpeg', q);
    if (finalDataUrl.length <= 650000) {
      break;
    }
  }

  if (finalDataUrl.length > 680000) {
    throw new Error('Compressed image is still too large. Please use a smaller image.');
  }

  return {
    dataUrl: finalDataUrl,
    sizeKb: Math.round((finalDataUrl.length * 0.75) / 1024),
    width,
    height,
  };
}
