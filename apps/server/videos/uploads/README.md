# Video Uploads Folder

Place your raw video files here for processing.

## Supported Formats
- MP4, MOV, AVI, WebM, etc.
- Any resolution (will be converted to 720p)
- Any aspect ratio (will be converted to 16:9 landscape)

## Required Videos
Place these 5 videos here:
1. `gaming.mp4` (or any format) - Gaming session intro
2. `eat.mp4` - Food break scene
3. `party.mp4` - Party scene
4. `zombies.mp4` - Zombie ending
5. `wakeup.mp4` - Wakeup ending

## Processing
Run `npm run process-videos` to convert all videos to:
- 1280x720 resolution (720p)
- 16:9 landscape aspect ratio
- H.264 codec
- Optimized file size

Processed videos will be placed in `../processed/` folder.
