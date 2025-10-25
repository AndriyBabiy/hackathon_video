# Quick Start Guide

Get your Interactive Video Voting app running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /Users/andriybabiy/hackathons/video_generation/project
npm install
```

This installs all dependencies for client, server, and shared packages.

## Step 2: Build Shared Types

```bash
npm run build:shared
```

This compiles the TypeScript types that are shared between client and server.

## Step 3: Add Your Videos

Your teammates are generating videos. Once ready, place them in:

```
apps/server/public/videos/
```

Based on the default story config, you need these 7 video files:
- `intro.mp4`
- `forest_path.mp4`
- `village_path.mp4`
- `forest_ending_1.mp4`
- `forest_ending_2.mp4`
- `village_ending_1.mp4`
- `village_ending_2.mp4`

## Step 4: Update Story Config (Optional)

If your video filenames or story structure differs, edit:
```
apps/server/story-config.json
```

Match the `videoFile` fields to your actual filenames.

## Step 5: Start Development Server

```bash
npm run dev
```

This starts:
- Client on http://localhost:5173
- Server on http://localhost:3000

## Step 6: Test the Application

### Test as Host:
1. Open http://localhost:5173
2. Click "Start as Host"
3. You'll see a QR code and session ID

### Test as Voter:
1. Open a new browser tab/window
2. Scan the QR code OR manually visit: http://localhost:5173/session/{sessionId}
3. You should see "Ready to Vote!"

### Run a Full Test:
1. As host, click "Start Voting"
2. As voter, select an option and vote
3. The winning video should play on both screens

## Troubleshooting

### "Story configuration file not found"
- Make sure you created `apps/server/story-config.json`
- The template is at `apps/server/story-config.template.json`

### Videos not loading
- Check video files are in `apps/server/public/videos/`
- Verify filenames match exactly in `story-config.json`
- Video files must be `.mp4` format

### TypeScript errors
```bash
npm run build:shared
```

### Port already in use
Edit `apps/server/.env` and change PORT to a different number.

### Socket.IO connection fails
- Ensure both client and server are running
- Check that CLIENT_URL in `apps/server/.env` is `http://localhost:5173`

## Next Steps

Once everything works locally:

1. **Deploy to Railway** (see docs/implementation-guide.md)
2. **Customize the story** by editing `story-config.json`
3. **Add more videos** and create branching paths
4. **Style the UI** by editing component styles

## File Structure Overview

```
project/
├── apps/
│   ├── client/          # React frontend (port 5173)
│   └── server/          # Express backend (port 3000)
│       ├── public/videos/  ← PUT YOUR VIDEOS HERE
│       └── story-config.json  ← CONFIGURE YOUR STORY HERE
├── packages/
│   └── shared/          # TypeScript types
└── package.json         # Root workspace config
```

## Key Commands

```bash
npm install              # Install all dependencies
npm run dev              # Run client + server
npm run build            # Build everything for production
npm run build:shared     # Build shared types only
npm run dev:client       # Run client only
npm run dev:server       # Run server only
```

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [docs/architecture.md](../docs/architecture.md) for system design
- See [docs/implementation-guide.md](../docs/implementation-guide.md) for step-by-step instructions

Good luck with your hackathon! 🚀
