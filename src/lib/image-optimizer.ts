
import sharp from 'sharp';

/**
 * Optimizes an image buffer using Sharp.
 * @param buffer The image buffer to optimize.
 * @param maxWidth The maximum width of the output image.
 * @param quality The quality of the output image (1-100).
 * @returns A promise that resolves to the optimized image buffer.
 */
export async function optimizeImage(
  buffer: ArrayBuffer,
  maxWidth: number = 1024,
  quality: number = 85
): Promise<Buffer> {
  try {
    const image = sharp(Buffer.from(buffer));
    const metadata = await image.metadata();

    // Only resize if the image is wider than the max width
    if (metadata.width && metadata.width > maxWidth) {
      image.resize({ width: maxWidth });
    }

    // Convert to webp for better compression, but can also use jpeg, etc.
    return image.webp({ quality }).toBuffer();
  } catch (error) {
    console.error("Image optimization failed:", error);
    // If sharp fails, return the original buffer
    return Buffer.from(buffer);
  }
}
