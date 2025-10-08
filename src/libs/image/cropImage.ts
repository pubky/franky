import type { Area } from 'react-easy-crop';

type CropArea = Pick<Area, 'x' | 'y' | 'width' | 'height'>;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (event) => reject(event));
    image.setAttribute('crossorigin', 'anonymous');
    image.src = src;
  });
}

function createBlobFromCanvas(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to crop image'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export async function cropImageToBlob(
  imageSrc: string,
  cropArea: CropArea,
  mimeType = 'image/png',
  quality?: number,
): Promise<Blob> {
  if (!imageSrc) {
    throw new Error('Image source is required to crop');
  }

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const outputWidth = Math.round(cropArea.width);
  const outputHeight = Math.round(cropArea.height);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  context.imageSmoothingQuality = 'high';

  context.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, outputWidth, outputHeight);

  return createBlobFromCanvas(canvas, mimeType, quality);
}
