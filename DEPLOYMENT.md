# Deployment Guide

This guide explains how to deploy the Interactive Video Voting Application to production.

## 🚨 CRITICAL: Read This First!

**Video Storage Issue:** Before deploying, you MUST address video file storage. Videos are currently in `.gitignore` and won't be deployed to Railway.

**Quick Fix for Demo/Hackathon:**
1. Comment out video exclusions in `.gitignore`
2. Commit videos to Git
3. Deploy

**For detailed solutions, see [VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md)**

---

## Quick Start - Railway Deployment (Recommended)

Railway is the recommended platform for deploying this application. It provides:
- WebSocket support
- Zero cold starts
- Easy environment variable management
- Automatic deploys from Git

### Prerequisites

1. Create a [Railway](https://railway.app/) account
2. Install Railway CLI (optional): `npm install -g @railway/cli`

### Prerequisites

**IMPORTANT:** Before deploying, handle video storage:

**Option A - Quick (for demos):**
```bash
# 1. Edit .gitignore and comment out video exclusions:
# apps/server/public/videos/*.mp4
# apps/server/public/videos/*.webm

# 2. Commit videos
git add apps/server/public/videos/
git commit -m "Add videos for deployment"
git push origin main
```

**Option B - Production (Railway Volumes):**
- See [VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md) for Railway Volumes setup
- Mount path: `/app/apps/server/public/videos`

**Option C - Best (Cloud Storage):**
- Use Cloudflare R2, AWS S3, or similar
- See [VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md) for details

### Deployment Steps

#### Option 1: Deploy via Railway Dashboard (Easiest)

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway and select your repository

2. **Configure Environment Variables**
   - After deployment, go to your project settings
   - Click on "Variables" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     PORT=${{PORT}}
     CLIENT_URL=https://your-app.up.railway.app
     ```
   - Note: `${{PORT}}` is a Railway variable that auto-fills the port

3. **Update Client URL**
   - Once deployed, Railway will give you a URL (e.g., `https://your-app-abc123.up.railway.app`)
   - Go back to Variables and update `CLIENT_URL` with your actual Railway URL
   - Redeploy if needed

4. **Access Your App**
   - Your app will be live at the Railway-provided URL
   - Open the URL to create a session and start voting!

#### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set CLIENT_URL=https://your-app.up.railway.app

# Deploy
railway up
```

### Environment Variables Reference

#### Server (.env in apps/server)
```bash
# Port - Railway auto-assigns via ${{PORT}}
PORT=${{PORT}}

# Client URL - Your Railway app URL
CLIENT_URL=https://your-app.up.railway.app

# Environment
NODE_ENV=production
```

#### Client (.env in apps/client - NOT NEEDED FOR PRODUCTION)
The client reads from the same origin in production, so you don't need to create a `.env` file for the client in production. The config automatically uses `window.location.origin`.

If you want to connect to a different server URL, you can build the client with:
```bash
VITE_SERVER_URL=https://your-server.up.railway.app npm run build
```

## Alternative Platforms

### Render.com

1. Create a new Web Service
2. Connect your Git repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables:
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-app.onrender.com
   ```
5. Deploy

**Note:** Render free tier has 50-second cold starts, which may affect live demos.

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create app: `fly launch`
4. Set environment variables:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set CLIENT_URL=https://your-app.fly.dev
   ```
5. Deploy: `fly deploy`

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can create a session and get QR code
- [ ] Can join session from mobile device
- [ ] Video playback works
- [ ] Voting functionality works
- [ ] Real-time updates work across devices
- [ ] WebSocket connection is stable

## Troubleshooting

### WebSocket Connection Failed

**Problem:** Client can't connect to server via WebSocket

**Solution:**
1. Check that `CLIENT_URL` environment variable is set correctly
2. Verify CORS is allowing your client URL
3. Check that the platform supports WebSocket (Vercel/Netlify do NOT)
4. Test with: `wscat -c wss://your-app.up.railway.app/socket.io/?transport=websocket`

### Videos Not Loading

**Problem:** Videos return 404 errors

**Solution:**
1. **CRITICAL:** Check if videos are in Git or Railway Volume
   ```bash
   # Check if videos are in Git
   git ls-files apps/server/public/videos/

   # If empty, videos aren't in Git - see VIDEO_STORAGE_GUIDE.md
   ```
2. For Git-based deployment:
   - Comment out video exclusions in `.gitignore`
   - Commit videos: `git add apps/server/public/videos/ && git commit && git push`
3. For Railway Volumes:
   - Verify volume is mounted: Check Railway Dashboard → Service → Storage
   - Upload videos to volume via Railway SSH
4. Test video URL directly: `https://your-app.up.railway.app/videos/intro.mp4`
5. Check Railway logs: `railway logs`

**See [VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md) for complete solutions.**

### CORS Errors

**Problem:** CORS policy blocking requests

**Solution:**
1. Verify `CLIENT_URL` environment variable matches your actual URL
2. Check server CORS configuration in `apps/server/src/index.ts`
3. Ensure Railway URL is using HTTPS (not HTTP)

### Build Failures

**Problem:** Build fails during deployment

**Solution:**
1. Check Railway build logs for errors
2. Ensure all dependencies are in `package.json` (not just `devDependencies`)
3. Verify Node version matches (use Node 20 LTS)
4. Test build locally: `npm run build`

### Environment Variable Not Found

**Problem:** Server can't read environment variables

**Solution:**
1. Make sure environment variables are set in Railway dashboard
2. Use Railway's `${{PORT}}` syntax for the PORT variable
3. Check `.env` files are not committed to Git
4. Verify `dotenv` is loaded in server: `config()`

## Monitoring & Logs

### Railway Logs

View real-time logs:
```bash
railway logs
```

Or view in Railway Dashboard → Your Project → Deployments → View Logs

### Health Check

Test if your server is running:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T12:00:00.000Z",
  "uptime": 123.456
}
```

### Stats Endpoint

Monitor server stats:
```bash
curl https://your-app.up.railway.app/api/stats
```

## Updating Your Deployment

### Automatic Deploys (Railway)

Railway automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploys (Railway CLI)

```bash
railway up
```

## Cost Estimates

### Railway (Recommended)
- **Hobby Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (unlimited)
- **Trial**: $5 credit (no credit card required)

### Render
- **Free Tier**: $0 (with 50s cold starts)
- **Starter**: $7/month (no cold starts)

### Fly.io
- **Free Tier**: 3 shared VMs (limited)
- **Paid**: ~$6-8/month

## Production Optimizations

For better production performance, consider:

1. **Add Redis for session storage** (instead of in-memory Map)
2. **Use CDN for video files** (Cloudflare R2 or AWS S3)
3. **Enable compression**: `npm install compression`
4. **Add rate limiting**: `npm install express-rate-limit`
5. **Setup monitoring**: Sentry, DataDog, or LogRocket
6. **Use HLS video streaming** for better bandwidth management

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Review this troubleshooting guide
3. Test locally first: `npm run dev`
4. Check Railway status: https://status.railway.app/
