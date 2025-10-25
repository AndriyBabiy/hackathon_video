#!/usr/bin/env tsx

/**
 * Video Processing Script
 *
 * Converts all videos in the uploads folder to:
 * - 1280x720 resolution (720p)
 * - 16:9 landscape aspect ratio
 * - H.264 codec
 * - MP4 format
 * - Optimized file size
 *
 * Usage: npm run process-videos
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Folder paths
const UPLOADS_DIR = join(__dirname, '../videos/uploads');
const PROCESSED_DIR = join(__dirname, '../videos/processed');
const PUBLIC_DIR = join(__dirname, '../public/videos');

// Target video specifications
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const TARGET_ASPECT = '16:9';

// Supported input formats
const SUPPORTED_FORMATS = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.m4v'];

interface VideoInfo {
  width: number;
  height: number;
  aspectRatio: string;
  codec: string;
  duration: number;
}

/**
 * Get video metadata
 */
async function getVideoInfo(filePath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      const width = videoStream.width || 0;
      const height = videoStream.height || 0;
      const aspectRatio = videoStream.display_aspect_ratio || `${width}:${height}`;
      const codec = videoStream.codec_name || 'unknown';
      const duration = metadata.format.duration || 0;

      resolve({
        width,
        height,
        aspectRatio,
        codec,
        duration,
      });
    });
  });
}

/**
 * Check if video needs processing
 */
function needsProcessing(info: VideoInfo): boolean {
  // Check if already 720p landscape
  if (info.width === TARGET_WIDTH && info.height === TARGET_HEIGHT) {
    console.log('  ✓ Already 720p, but will re-encode to ensure H.264');
    return true; // Still process to ensure H.264 codec
  }

  // Check if landscape orientation
  if (info.width < info.height) {
    console.log('  ⚠ WARNING: Video is portrait, will be converted to landscape');
    return true;
  }

  console.log('  → Needs conversion to 720p landscape');
  return true;
}

/**
 * Process a single video
 */
async function processVideo(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('  → Starting conversion...');

    ffmpeg(inputPath)
      // Video codec and quality
      .videoCodec('libx264')
      .videoBitrate('2500k') // Good quality for 720p

      // Audio settings
      .audioCodec('aac')
      .audioBitrate('128k')

      // Size and aspect ratio
      .size(`${TARGET_WIDTH}x${TARGET_HEIGHT}`)
      .aspect(TARGET_ASPECT)
      .autopad(true, 'black') // Add black bars if needed to maintain aspect ratio

      // Output format
      .format('mp4')

      // Additional optimizations
      .outputOptions([
        '-preset fast', // Encoding speed (fast, medium, slow)
        '-crf 23', // Quality (18-28, lower = better quality)
        '-profile:v high', // H.264 profile
        '-pix_fmt yuv420p', // Pixel format for compatibility
        '-movflags +faststart', // Enable streaming
      ])

      // Progress tracking
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  → Converting: ${progress.percent.toFixed(1)}%`);
        }
      })

      // Success
      .on('end', () => {
        console.log('\n  ✓ Conversion complete');
        resolve();
      })

      // Error
      .on('error', (err) => {
        console.log('\n  ✗ Conversion failed');
        reject(err);
      })

      // Save to output
      .save(outputPath);
  });
}

/**
 * Copy processed video to public folder
 */
async function copyToPublic(processedPath: string, filename: string): Promise<void> {
  const publicPath = join(PUBLIC_DIR, filename);
  await fs.copyFile(processedPath, publicPath);
  console.log(`  ✓ Copied to public/videos/`);
}

/**
 * Main processing function
 */
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  Video Processing Script');
  console.log('  Target: 1280x720 (720p), 16:9 landscape, H.264');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  try {
    // Ensure directories exist
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // Get all video files from uploads
    const files = await fs.readdir(UPLOADS_DIR);
    const videoFiles = files.filter(file =>
      SUPPORTED_FORMATS.includes(extname(file).toLowerCase()) &&
      !file.startsWith('.')
    );

    if (videoFiles.length === 0) {
      console.log('⚠ No video files found in uploads folder');
      console.log(`  Place videos in: ${UPLOADS_DIR}`);
      console.log('');
      return;
    }

    console.log(`Found ${videoFiles.length} video(s) to process\n`);

    // Process each video
    for (let i = 0; i < videoFiles.length; i++) {
      const filename = videoFiles[i];
      const inputPath = join(UPLOADS_DIR, filename);

      // Output filename (always .mp4)
      const baseName = basename(filename, extname(filename));
      const outputFilename = `${baseName}.mp4`;
      const processedPath = join(PROCESSED_DIR, outputFilename);

      console.log(`[${i + 1}/${videoFiles.length}] Processing: ${filename}`);
      console.log('─────────────────────────────────────────────');

      try {
        // Get video info
        console.log('  → Analyzing video...');
        const info = await getVideoInfo(inputPath);
        console.log(`  → Current: ${info.width}x${info.height}, ${info.aspectRatio}, ${info.codec}`);
        console.log(`  → Duration: ${info.duration.toFixed(1)}s`);

        // Check if processing is needed
        const needsConversion = needsProcessing(info);

        if (needsConversion) {
          // Process the video
          await processVideo(inputPath, processedPath);

          // Get processed video info
          const processedInfo = await getVideoInfo(processedPath);
          const inputSize = (await fs.stat(inputPath)).size;
          const outputSize = (await fs.stat(processedPath)).size;

          console.log(`  → Processed: ${processedInfo.width}x${processedInfo.height}, ${processedInfo.codec}`);
          console.log(`  → Size: ${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(outputSize / 1024 / 1024).toFixed(2)}MB`);

          // Copy to public folder
          await copyToPublic(processedPath, outputFilename);
        }

        console.log('  ✓ Done!\n');

      } catch (error) {
        console.error(`  ✗ Error processing ${filename}:`, error);
        console.log('');
      }
    }

    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('  Processing Complete!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Review processed videos in: ${PROCESSED_DIR}`);
    console.log(`  2. Final videos are in: ${PUBLIC_DIR}`);
    console.log('  3. Test the videos in your app');
    console.log('  4. Commit videos to Git (if using deployment Option 1)');
    console.log('');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
