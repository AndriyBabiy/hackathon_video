# Video Storage Guide for Railway Deployment

## 🚨 Critical Issue Identified

**Problem:** The current setup has a critical flaw for production deployment:

1. **Videos are in `.gitignore`** - They won't be deployed to Railway
2. **Railway filesystem is ephemeral** - Any files created/uploaded during runtime are lost on redeploy
3. **Videos won't be accessible** - The app will fail to serve videos after deployment

## Understanding the Problem

### Current Configuration

```gitignore
# From .gitignore
# Videos (generated content)
apps/server/public/videos/*.mp4
apps/server/public/videos/*.webm
```

This means:
- Video files in `apps/server/public/videos/` are NOT committed to Git
- When deployed to Railway, this directory will be **empty**
- Video URLs like `/videos/intro.mp4` will return **404 Not Found**

### Railway Storage Facts

From Railway's documentation:
- **Filesystem is ephemeral** - Files don't persist between deployments
- **Each deployment starts fresh** - Only files from Git are included
- **Uploaded files are lost** - Any files created at runtime disappear on redeploy

## Solution Options

### Option 1: Commit Videos to Git (Easiest ✅)

**Best for:** Small projects, hackathons, prototypes, <50MB of videos

**Pros:**
- Simplest solution
- Works immediately
- No additional setup required
- Free

**Cons:**
- Large repository size
- Slow Git operations
- Not scalable for many videos

**Implementation:**

1. **Update `.gitignore`** to allow video files:

```gitignore
# Remove or comment out these lines:
# apps/server/public/videos/*.mp4
# apps/server/public/videos/*.webm

# Keep the .gitkeep file
!apps/server/public/videos/.gitkeep
```

2. **Add videos to Git:**

```bash
cd project
git add apps/server/public/videos/*.mp4
git commit -m "Add video files for deployment"
git push origin main
```

3. **Deploy to Railway** - Videos will now be included!

**Limitations:**
- GitHub has file size limits: 100MB per file, 1GB total repo recommended
- Large repos slow down Git operations
- Not ideal for >10 videos

---

### Option 2: Use Railway Volumes (Better 🎯)

**Best for:** Medium projects, multiple videos, persistent storage needs

**Pros:**
- Persistent storage (survives redeployments)
- No repo bloat
- Can handle larger files
- Professional solution

**Cons:**
- One-time manual setup
- Need to upload videos via CLI/SSH
- Costs: $0.20/GB/month after 1GB free

**Implementation:**

#### Step 1: Create a Railway Volume

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Create a volume (1GB minimum)
railway volume add --name videos --mount-path /app/apps/server/public/videos --size 1
```

Or via Railway Dashboard:
1. Go to your service
2. Click "Storage" tab
3. Click "New Volume"
4. Name: `videos`
5. Mount path: `/app/apps/server/public/videos`
6. Size: 1GB (adjust as needed)

#### Step 2: Upload Videos to Volume

**Method A: Via Railway SSH**

```bash
# Connect to your Railway service
railway shell

# Inside the Railway shell, download/upload videos
# Option 1: Download from a URL
wget -O /app/apps/server/public/videos/intro.mp4 https://your-storage.com/intro.mp4

# Option 2: Use curl
curl -o /app/apps/server/public/videos/intro.mp4 https://your-storage.com/intro.mp4

# Exit
exit
```

**Method B: Upload via SCP (requires Railway SSH setup)**

```bash
# Get Railway SSH connection string
railway ssh

# In a separate terminal, use SCP to copy files
# (This is complex and not officially supported)
```

**Method C: Upload from another service**

```bash
# Create a temporary upload endpoint in your app
# POST /admin/upload-video (protected route)
# Then curl from your local machine
```

#### Step 3: Update Server Code (Optional)

Ensure the server serves from the volume mount path:

```typescript
// apps/server/src/index.ts
// This should already be correct:
const publicPath = join(__dirname, '../public');
app.use('/videos', express.static(join(publicPath, 'videos')));
```

#### Step 4: Deploy

Railway will now mount the volume at `/app/apps/server/public/videos`, and videos will persist!

**Volume Pricing:**
- First 1GB: Free
- Additional storage: $0.20/GB/month

---

### Option 3: Use Cloud Storage (Best for Production 🚀)

**Best for:** Production apps, scalability, CDN delivery, many videos

**Pros:**
- Unlimited scalability
- CDN-ready (fast global delivery)
- Professional solution
- Separate from deployment

**Cons:**
- Most complex setup
- Requires additional service
- Monthly costs (usually <$1 for small apps)

**Recommended Services:**
1. **Cloudflare R2** - $0.015/GB/month storage, free egress
2. **AWS S3** - $0.023/GB/month storage, pay-per-request
3. **Backblaze B2** - $0.005/GB/month storage, first 10GB free

**Implementation:**

#### Step 1: Choose and Setup Cloud Storage

**Example: Cloudflare R2**

1. Create Cloudflare account
2. Go to R2 Object Storage
3. Create bucket: `video-voting-videos`
4. Upload videos via web UI or CLI
5. Make bucket public (or use signed URLs)

#### Step 2: Update Server Code

**Option A: Serve via Redirect**

```typescript
// apps/server/src/index.ts
const VIDEO_CDN_URL = process.env.VIDEO_CDN_URL || '';

// Redirect /videos/* to CDN
app.use('/videos', (req, res) => {
  const videoPath = req.path;
  const cdnUrl = `${VIDEO_CDN_URL}${videoPath}`;
  res.redirect(cdnUrl);
});
```

**Option B: Proxy Through Server**

```typescript
import fetch from 'node-fetch';

app.get('/videos/:filename', async (req, res) => {
  const filename = req.params.filename;
  const cdnUrl = `${process.env.VIDEO_CDN_URL}/${filename}`;

  try {
    const response = await fetch(cdnUrl);
    const buffer = await response.buffer();
    res.set('Content-Type', 'video/mp4');
    res.send(buffer);
  } catch (error) {
    res.status(404).send('Video not found');
  }
});
```

**Option C: Update Client to Use CDN Directly (Best)**

```typescript
// apps/client/src/config.ts
export const config = {
  serverUrl: getServerUrl(),
  videoCdnUrl: import.meta.env.VITE_VIDEO_CDN_URL || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

// Update story config to use CDN URLs
const videoUrl = config.videoCdnUrl
  ? `${config.videoCdnUrl}/intro.mp4`
  : '/videos/intro.mp4';
```

#### Step 3: Set Environment Variables

```bash
# Railway Dashboard → Variables
VIDEO_CDN_URL=https://pub-xxxxx.r2.dev/video-voting-videos
```

#### Step 4: Deploy

Videos are now served from cloud storage, completely independent of your app deployment!

**Cloudflare R2 Pricing Example:**
- 10GB storage: $0.15/month
- 100GB transfer: FREE (no egress fees)
- **Total: ~$0.15/month**

---

## Recommended Approach by Use Case

### For Hackathon/Demo (Today)
**Use Option 1: Commit to Git**
- Fastest to implement
- Works immediately
- Perfect for <50MB of videos

### For MVP/Small Production
**Use Option 2: Railway Volumes**
- Clean separation
- Persistent storage
- Professional setup
- Good for <10GB of videos

### For Scalable Production
**Use Option 3: Cloud Storage (Cloudflare R2)**
- Best performance
- Global CDN
- Unlimited scalability
- Industry standard

---

## Quick Start: Option 1 Implementation

**For immediate deployment, here's the fastest path:**

1. **Update .gitignore:**
```bash
cd /Users/andriybabiy/hackathons/video_generation/project
```

Edit `.gitignore` and comment out these lines:
```gitignore
# Videos (generated content) - COMMENTED FOR DEPLOYMENT
# apps/server/public/videos/*.mp4
# apps/server/public/videos/*.webm
```

2. **Add videos to Git:**
```bash
git add apps/server/public/videos/
git commit -m "Add video files for Railway deployment"
git push origin main
```

3. **Deploy to Railway** - Videos are now included!

---

## Verification Checklist

After deployment, verify videos work:

- [ ] Visit: `https://your-app.up.railway.app/videos/intro.mp4`
- [ ] Should download/play the video (not 404)
- [ ] Check browser Network tab for 200 OK status
- [ ] Test in your app - videos should play

---

## Common Issues

### Video Returns 404
**Problem:** Video file not accessible

**Solutions:**
- Option 1: Check if videos are in Git (`git ls-files apps/server/public/videos/`)
- Option 2: Check if volume is mounted (`railway logs` and look for mount paths)
- Option 3: Check CDN URL is correct

### Videos Lost After Redeploy
**Problem:** Using ephemeral filesystem

**Solution:**
- Switch to Option 2 (Volumes) or Option 3 (Cloud Storage)
- Never rely on filesystem for user-uploaded content on Railway

### Large Repo Size
**Problem:** Repository is >1GB

**Solution:**
- Use Git LFS for video files: https://git-lfs.github.com/
- Or switch to Option 2 or Option 3

---

## Production Recommendations

For a production-ready setup, I recommend:

1. **Use Cloudflare R2** for video storage ($0.15/month for 10GB)
2. **Enable Railway Volumes** for any user-generated content
3. **Use Railway's built-in CDN** for static assets
4. **Implement video transcoding** if videos are >5MB
5. **Add video loading states** in the UI

---

## Cost Comparison

### Option 1: Git (Free)
- ✅ Storage: Free
- ❌ Limit: ~1GB
- ❌ Performance: Slower deployments

### Option 2: Railway Volume ($0.20/GB/month)
- ✅ Storage: $0.20/GB after 1GB free
- ✅ Limit: Unlimited
- ✅ Performance: Good

### Option 3: Cloudflare R2 ($0.015/GB/month)
- ✅ Storage: $0.015/GB
- ✅ Limit: Unlimited
- ✅ Performance: Excellent (CDN)
- ✅ Egress: FREE

**Example for 10GB of videos:**
- Option 1: Free (if under 1GB)
- Option 2: $1.80/month (Railway)
- Option 3: $0.15/month (Cloudflare R2)

---

*Last Updated: 2025-10-25 by James (Developer)*
