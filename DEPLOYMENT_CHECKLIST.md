# Railway Deployment Checklist

Use this checklist to ensure a successful deployment to Railway.

## Pre-Deployment Checklist

### 1. Video Storage (CRITICAL ⚠️)
- [ ] **Decided on video storage strategy** (see VIDEO_STORAGE_GUIDE.md)
  - [ ] Option A: Commit videos to Git (easiest, for demos)
  - [ ] Option B: Use Railway Volumes (better, for production)
  - [ ] Option C: Use Cloud Storage (best, for scale)

- [ ] **If using Git (Option A):**
  - [ ] Commented out video exclusions in `.gitignore`
  - [ ] Committed videos: `git add apps/server/public/videos/`
  - [ ] Pushed to repository: `git push origin main`
  - [ ] Verified videos in repo: `git ls-files apps/server/public/videos/`

- [ ] **If using Railway Volumes (Option B):**
  - [ ] Created volume in Railway Dashboard
  - [ ] Set mount path: `/app/apps/server/public/videos`
  - [ ] Uploaded videos via Railway SSH or API
  - [ ] Verified volume shows in Railway Dashboard

- [ ] **If using Cloud Storage (Option C):**
  - [ ] Setup Cloudflare R2 / AWS S3 bucket
  - [ ] Uploaded videos to cloud storage
  - [ ] Made videos publicly accessible
  - [ ] Updated server code to redirect/proxy videos
  - [ ] Set `VIDEO_CDN_URL` environment variable

### 2. Code Preparation
- [ ] **Build test passes locally**
  ```bash
  npm run build
  ```
- [ ] **No hardcoded localhost URLs**
  - [ ] VoterView.tsx uses `config.serverUrl` ✅
  - [ ] HostPanel.tsx uses `config.serverUrl` ✅
- [ ] **Environment config created**
  - [ ] `apps/client/src/config.ts` exists ✅
  - [ ] `apps/client/.env.example` exists ✅
- [ ] **All changes committed and pushed to GitHub**

### 3. Railway Configuration Files
- [ ] **railway.json exists** ✅
- [ ] **Procfile exists** ✅
- [ ] **Package.json scripts configured:**
  - [ ] `build` command ✅
  - [ ] `start` command ✅

## Deployment Steps

### 4. Railway Project Setup
- [ ] **Created Railway account**
- [ ] **Created new project** from GitHub repo
- [ ] **Connected GitHub repository**

### 5. Environment Variables
- [ ] **Set required variables in Railway Dashboard:**
  ```bash
  NODE_ENV=production
  PORT=${{PORT}}
  CLIENT_URL=https://your-app.up.railway.app
  ```
- [ ] **Optional variables (if using cloud storage):**
  ```bash
  VIDEO_CDN_URL=https://your-cdn-url.com
  ```

### 6. First Deployment
- [ ] **Triggered deployment** (automatic on push or manual)
- [ ] **Waited for build to complete** (~3-5 minutes)
- [ ] **Got deployment URL** from Railway
- [ ] **Updated CLIENT_URL** with actual Railway URL
- [ ] **Redeployed** if CLIENT_URL was updated

## Post-Deployment Verification

### 7. Functionality Tests
- [ ] **App loads successfully**
  - [ ] Visit: `https://your-app.up.railway.app`
  - [ ] No console errors

- [ ] **Static files work**
  - [ ] CSS loads correctly
  - [ ] No 404 errors in Network tab

- [ ] **Videos load (CRITICAL)**
  - [ ] Test direct URL: `https://your-app.up.railway.app/videos/intro.mp4`
  - [ ] Should return 200 OK (not 404)
  - [ ] Video should download/play

- [ ] **WebSocket connection works**
  - [ ] Can create a session
  - [ ] QR code generates
  - [ ] Real-time updates work

- [ ] **Full user flow works**
  - [ ] Host can create session ✅
  - [ ] Voter can join via URL ✅
  - [ ] Video playback works ✅
  - [ ] Voting interface appears ✅
  - [ ] Vote counting works ✅
  - [ ] Results display correctly ✅

### 8. Performance Checks
- [ ] **Page load time** < 3 seconds
- [ ] **Video starts playing** within 2 seconds
- [ ] **WebSocket connects** immediately
- [ ] **No memory leaks** (check Railway metrics)

### 9. Error Monitoring
- [ ] **Check Railway logs**
  ```bash
  railway logs
  ```
- [ ] **No error messages** in logs
- [ ] **Health endpoint works**
  ```bash
  curl https://your-app.up.railway.app/health
  ```

## Production Readiness (Optional)

### 10. Performance Optimizations
- [ ] **Enable gzip compression** (add to server)
- [ ] **Add rate limiting** (prevent abuse)
- [ ] **Setup CDN** for videos (Cloudflare R2)
- [ ] **Implement video preloading**

### 11. Monitoring & Analytics
- [ ] **Setup Sentry** for error tracking
- [ ] **Add analytics** (PostHog, Mixpanel, etc.)
- [ ] **Monitor Railway metrics** (CPU, Memory)

### 12. Security
- [ ] **Environment variables secured** (not in Git)
- [ ] **CORS configured correctly**
- [ ] **No sensitive data exposed** in client

## Common Issues & Solutions

### Videos Return 404
**Fix:** See VIDEO_STORAGE_GUIDE.md - likely videos aren't in Git/Volume

### WebSocket Won't Connect
**Fix:** Check CLIENT_URL matches actual Railway URL exactly

### Build Fails
**Fix:** Run `npm run build` locally first, fix TypeScript errors

### App Crashes on Start
**Fix:** Check Railway logs, ensure PORT is not hardcoded

## Quick Reference

### Railway Commands
```bash
# View logs
railway logs

# Deploy current directory
railway up

# Open app in browser
railway open

# View variables
railway variables

# Add variable
railway variables set KEY=value
```

### Test Endpoints
```bash
# Health check
curl https://your-app.up.railway.app/health

# Video test
curl -I https://your-app.up.railway.app/videos/intro.mp4

# Stats endpoint
curl https://your-app.up.railway.app/api/stats
```

## Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Videos play correctly
- ✅ WebSocket connects and stays connected
- ✅ Multiple users can join and vote
- ✅ Real-time updates work across devices
- ✅ No crashes or memory leaks in Railway logs

## Next Steps After Deployment

1. **Share the URL** with your team/users
2. **Test from multiple devices** (desktop, mobile, tablet)
3. **Monitor Railway dashboard** for any issues
4. **Setup custom domain** (optional)
5. **Consider upgrading storage** if using volumes/CDN

---

**Need Help?**
- See DEPLOYMENT.md for detailed instructions
- See VIDEO_STORAGE_GUIDE.md for video storage solutions
- Check Railway docs: https://docs.railway.app/
- Check Railway status: https://status.railway.app/

---

*Last Updated: 2025-10-25 by James (Developer)*
