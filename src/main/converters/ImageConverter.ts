import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface ConvertOptions {
  format: 'png' | 'jpeg' | 'webp' | 'avif';
  quality?: number;
  outputPath?: string;
}

export class ImageConverter {
  async getMetadata(filePath: string): Promise<ImageMetadata> {
    const stats = await fs.stat(filePath);
    const metadata = await sharp(filePath).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
    };
  }

  async convert(inputPath: string, options: ConvertOptions): Promise<string> {
    const { format, quality = 80, outputPath } = options;
    
    let targetPath = outputPath;
    if (!targetPath) {
      const dir = path.dirname(inputPath);
      const name = path.basename(inputPath, path.extname(inputPath));
      targetPath = path.join(dir, `${name}_converted.${format}`);
    }

    let pipeline = sharp(inputPath);

    switch (format) {
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
    }

    await pipeline.toFile(targetPath);
    return targetPath;
  }
}
