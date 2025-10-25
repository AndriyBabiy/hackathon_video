# Video Processing Guide

Complete guide for preparing videos for the Interactive Video Voting Application.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Video Requirements](#video-requirements)
- [Folder Structure](#folder-structure)
- [Processing Workflow](#processing-workflow)
- [Installation](#installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Advanced Options](#advanced-options)

---

## Quick Start

```bash
# 1. Place your raw videos in the uploads folder
cp your-videos/*.mp4 apps/server/videos/uploads/

# 2. Install dependencies (if not already installed)
npm install

# 3. Process all videos to 720p landscape
cd apps/server
npm run process-videos

# 4. Videos are ready in public/videos/
```

---

## Video Requirements

### Required Videos (5 total)

Based on the current story flow (`story-config.json`):

1. **gaming.mp4** - Late night gaming session intro
2. **eat.mp4** - Food break and social invitation scene
3. **party.mp4** - Wild party scene at 3 AM
4. **zombies.mp4** - Zombie mode activated ending (bad ending)
5. **wakeup.mp4** - Fresh morning ending (good ending)

### Technical Specifications

**MANDATORY Requirements**:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1280x720 (720p)
- **Aspect Ratio**: 16:9 landscape
- **Frame Rate**: 30fps or 60fps
- **Audio**: AAC codec, 128kbps

**Recommended**:
- **Length**: 20-40 seconds each
- **File Size**: <10MB per video (ideally 3-7MB)
- **Bitrate**: ~2500kbps (video), 128kbps (audio)
- **Total Size**: <50MB for all videos (for Git deployment)

**Why These Specs?**:
- **720p**: Balances quality and file size, works on all devices
- **Landscape 16:9**: Standard video format, fits all screens
- **H.264**: Universal codec, supported everywhere
- **<10MB**: Fast loading, smooth streaming, Git-friendly

---

## Folder Structure

```
apps/server/videos/
├── uploads/          # 📥 Raw videos (any size/format)
│   ├── gaming.mp4    # Your source videos
│   ├── eat.mov       # Can be any format
│   ├── party.avi     # Will be converted
│   └── README.md
│
├── processed/        # 🔄 Converted videos (720p landscape)
│   ├── gaming.mp4    # Auto-generated
│   ├── eat.mp4
│   └── README.md
│
└── public/videos/    # ✅ Final videos (ready for deployment)
    ├── gaming.mp4    # Deployed to production
    ├── eat.mp4
    ├── party.mp4
    ├── zombies.mp4
    └── wakeup.mp4
```

### Folder Purposes

- **uploads/**: Place your raw videos here (any resolution, any format)
- **processed/**: Auto-generated 720p landscape versions
- **public/videos/**: Final videos served to users (committed to Git)

---

## Processing Workflow

### Visual Workflow

```
[Raw Video]           [Processing Script]         [Final Output]
(any format)    →     (npm run process-videos) →  (720p, H.264, MP4)
                              ↓
                    1. Analyze video metadata
                    2. Convert to 1280x720
                    3. Ensure 16:9 landscape
                    4. Encode with H.264
                    5. Optimize file size
                    6. Copy to public/videos/
```

### Step-by-Step Process

#### 1. Upload Raw Videos
```bash
# Place videos in uploads folder
cp ~/Desktop/my-videos/*.* apps/server/videos/uploads/
```

Supported input formats:
- MP4, MOV, AVI, WebM, MKV, FLV, M4V
- Any resolution (4K, 1080p, 720p, etc.)
- Any aspect ratio (will be converted to 16:9)
- Portrait or landscape (will be converted to landscape)

#### 2. Run Processing Script
```bash
cd apps/server
npm run process-videos
```

The script will:
- ✅ Analyze each video
- ✅ Convert to 1280x720 resolution
- ✅ Ensure 16:9 landscape aspect ratio
- ✅ Add black bars if needed (letterboxing/pillarboxing)
- ✅ Encode with H.264 codec
- ✅ Optimize file size
- ✅ Copy to public/videos/ folder

#### 3. Verify Output
```bash
# Check processed videos
ls -lh apps/server/videos/processed/

# Check final videos
ls -lh apps/server/public/videos/
```

#### 4. Test Locally
```bash
# Start the dev server
npm run dev

# Visit http://localhost:5173/host
# Start a session and test video playback
```

#### 5. Deploy
```bash
# Commit videos to Git (if using deployment Option 1)
git add apps/server/public/videos/
git commit -m "Add story videos"
git push

# Deploy to Railway or your platform
```

---

## Installation

### Prerequisites

**Required: FFmpeg**

FFmpeg must be installed on your system:

**macOS**:
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows**:
1. Download from https://ffmpeg.org/download.html
2. Add to PATH environment variable

**Verify Installation**:
```bash
ffmpeg -version
```

### Install Node Dependencies

```bash
# From project root
npm install

# Or from server directory
cd apps/server
npm install
```

This installs:
- `fluent-ffmpeg` - FFmpeg wrapper for Node.js
- `@types/fluent-ffmpeg` - TypeScript types

---

## Usage

### Basic Usage

```bash
cd apps/server
npm run process-videos
```

### What You'll See

```
═══════════════════════════════════════════════
  Video Processing Script
  Target: 1280x720 (720p), 16:9 landscape, H.264
═══════════════════════════════════════════════

Found 5 video(s) to process

[1/5] Processing: gaming.mp4
─────────────────────────────────────────────
  → Analyzing video...
  → Current: 1920x1080, 16:9, h264
  → Duration: 25.4s
  → Needs conversion to 720p landscape
  → Starting conversion...
  → Converting: 100.0%
  ✓ Conversion complete
  → Processed: 1280x720, h264
  → Size: 12.34MB → 4.56MB
  ✓ Copied to public/videos/
  ✓ Done!

[2/5] Processing: eat.mov
...
```

### Output Files

After processing, you'll have:
- `apps/server/videos/processed/` - Processed videos (for review)
- `apps/server/public/videos/` - Final videos (for deployment)

---

## Troubleshooting

### "ffmpeg: command not found"

**Problem**: FFmpeg is not installed or not in PATH

**Solution**:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows: Download and add to PATH
```

### "No video files found"

**Problem**: No videos in uploads folder

**Solution**:
```bash
# Check uploads folder
ls apps/server/videos/uploads/

# Add videos
cp your-videos/*.mp4 apps/server/videos/uploads/
```

### "Video is portrait, will be converted to landscape"

**Problem**: Video was recorded vertically (phone video)

**Solution**: The script automatically converts portrait to landscape by adding black bars (pillarboxing). This is expected behavior.

If you want to avoid black bars:
1. Re-record video in landscape mode
2. Or crop the video before uploading

### "Conversion failed"

**Problem**: Video file is corrupted or unsupported format

**Solution**:
1. Check if video plays in VLC or other media player
2. Try converting manually first:
```bash
ffmpeg -i input.mp4 -c:v libx264 output.mp4
```
3. Use a different source video

### File size too large

**Problem**: Processed video is >10MB

**Solution**: The script uses optimized settings, but if still too large:
1. Reduce video length to 20-40 seconds
2. Lower bitrate (edit script, change `-b:v 2500k` to `-b:v 1500k`)
3. Increase compression (change `-crf 23` to `-crf 28`)

### Video quality is poor

**Problem**: Processed video looks pixelated

**Solution**: Increase quality in script:
1. Edit `apps/server/scripts/process-videos.ts`
2. Change `-crf 23` to `-crf 18` (lower = better quality)
3. Change `-b:v 2500k` to `-b:v 3500k` (higher bitrate)

---

## Advanced Options

### Custom Processing Settings

Edit `apps/server/scripts/process-videos.ts` to customize:

**Resolution**:
```typescript
const TARGET_WIDTH = 1920;  // Change to 1080p
const TARGET_HEIGHT = 1080;
```

**Bitrate** (quality vs file size):
```typescript
.videoBitrate('3500k')  // Higher = better quality, larger file
```

**Compression** (CRF value):
```typescript
'-crf 18'  // Lower = better quality (range: 18-28)
```

**Encoding Speed**:
```typescript
'-preset medium'  // Options: ultrafast, fast, medium, slow, veryslow
```

### Manual FFmpeg Commands

If you want to convert videos manually:

**Basic conversion**:
```bash
ffmpeg -i input.mp4 \
  -vf scale=1280:720 \
  -c:v libx264 \
  -crf 23 \
  -preset fast \
  -c:a aac \
  -b:a 128k \
  output.mp4
```

**Force 16:9 with black bars**:
```bash
ffmpeg -i input.mp4 \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -crf 23 \
  output.mp4
```

**Crop to 16:9 (no black bars)**:
```bash
ffmpeg -i input.mp4 \
  -vf "crop=ih*16/9:ih,scale=1280:720" \
  -c:v libx264 \
  -crf 23 \
  output.mp4
```

### Batch Processing with Different Resolutions

Create multiple output sizes:
```bash
# 720p
ffmpeg -i input.mp4 -s 1280x720 -c:v libx264 output-720p.mp4

# 1080p
ffmpeg -i input.mp4 -s 1920x1080 -c:v libx264 output-1080p.mp4

# 480p (for slower connections)
ffmpeg -i input.mp4 -s 854x480 -c:v libx264 output-480p.mp4
```

---

## Video Production Tips

### Recording/Creating Videos

**Recommended Tools**:
- **Screen Recording**: OBS Studio, QuickTime (Mac), Windows Game Bar
- **Video Editing**: DaVinci Resolve (free), Adobe Premiere, Final Cut Pro
- **AI Generation**: Runway ML, Synthesia, D-ID
- **Stock Footage**: Pexels, Pixabay, Unsplash (video section)

**Recording Best Practices**:
1. **Always record in landscape** (horizontal orientation)
2. **Use 1080p or higher** (will be downscaled to 720p)
3. **Keep videos 20-40 seconds** (short attention span)
4. **Test audio levels** (ensure dialogue is clear)
5. **Use consistent lighting/style** across all videos

### Content Guidelines

For each video type:

**gaming.mp4** (Intro):
- Show gaming setup, screen, controller
- Set the late-night mood (dark room, monitor glow)
- 20-30 seconds

**eat.mp4** (Middle):
- Show food delivery or eating
- Phone notification from friends
- 25-35 seconds

**party.mp4** (Decision):
- Show party scene, people, music
- Clock showing 3 AM
- Create sense of "should I stay or go?"
- 30-40 seconds

**zombies.mp4** (Bad ending):
- Show exhausted/hungover person
- Morning after partying too late
- Humorous "zombie mode" vibe
- 20-30 seconds

**wakeup.mp4** (Good ending):
- Show refreshed person waking up
- Bright morning, good mood
- Positive reinforcement
- 20-30 seconds

---

## Integration with Story Config

### Updating Videos

If you change filenames or add new videos:

1. **Update story-config.json**:
```json
{
  "id": "new_scene",
  "videoFile": "new_video.mp4",
  "type": "decision",
  "title": "New Scene"
}
```

2. **Process the new video**:
```bash
cp new_video.mp4 apps/server/videos/uploads/
npm run process-videos
```

3. **Test the flow**:
```bash
npm run dev
# Visit http://localhost:5173/host
```

---

## Deployment Checklist

Before deploying:

- [ ] All 5 videos processed and in `public/videos/`
- [ ] All videos are exactly 1280x720 (check with `ffmpeg -i video.mp4`)
- [ ] All videos are landscape 16:9
- [ ] Total size <50MB (check with `du -sh public/videos/`)
- [ ] Videos play correctly in local testing
- [ ] story-config.json matches video filenames
- [ ] No orphaned nodes in story (check `/api/stats`)

---

## Performance Optimization

### Preloading Videos

The app automatically preloads the next possible videos during voting. No additional configuration needed.

### CDN for Videos (Production)

For high traffic, consider using a CDN:
1. Upload videos to Cloudflare R2 or AWS S3
2. Update server to redirect video requests to CDN
3. Set appropriate cache headers

See `VIDEO_STORAGE_GUIDE.md` for cloud storage options.

---

## Quick Reference

### Commands
```bash
# Process all videos
npm run process-videos

# Check video info
ffmpeg -i video.mp4

# Test video playback
ffplay video.mp4
```

### Folder Locations
- **Uploads**: `apps/server/videos/uploads/`
- **Processed**: `apps/server/videos/processed/`
- **Public**: `apps/server/public/videos/`
- **Script**: `apps/server/scripts/process-videos.ts`

### File Naming
Videos must match `story-config.json`:
- gaming.mp4
- eat.mp4
- party.mp4
- zombies.mp4
- wakeup.mp4

---

## Getting Help

### Common Issues
1. Check FFmpeg is installed: `ffmpeg -version`
2. Check videos are in uploads folder: `ls apps/server/videos/uploads/`
3. Check for errors in script output
4. Try processing one video at a time
5. Verify video plays in VLC/other player before processing

### Resources
- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Fluent-FFmpeg**: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- **Video Codecs**: https://trac.ffmpeg.org/wiki/Encode/H.264

---

*Last Updated: October 25, 2025*
*For story flow details, see STORY_FLOW.md*
*For deployment, see DEPLOYMENT.md*
