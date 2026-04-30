# Deployment Guide: Coolify

This guide walks you through deploying this Event Management app to Coolify at `event.transmetatek.com`.

## Prerequisites

- Coolify instance running and accessible
- GitHub repository with this code pushed
- Domain `event.transmetatek.com` pointing to your Coolify server

## Step-by-Step Deployment

### 1. Push to GitHub
Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Docker configuration for Coolify deployment"
git push
```

### 2. In Coolify Dashboard

1. **Create a new project** (if you don't have one)
2. **Add a new resource** → Select "Docker"
3. **Configure the deployment:**
   - **Name:** Event Management
   - **Git Repository:** Paste your GitHub repo URL
   - **Branch:** main
   - **Dockerfile Path:** ./Dockerfile (default)
   - **Build Pack:** leave as Dockerfile

### 3. Configure Environment Variables

In Coolify's deployment settings, add these environment variables:

**Required:**
```
APP_URL=https://event.transmetatek.com
NODE_ENV=production
```

**Database & Storage:**
```
DATABASE_URL=file:./data/app.db
UPLOAD_DIR=./data/uploads
```

**Google OAuth:**
Set up Google OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/):
1. Create a new project or use existing one
2. Enable Google Identity API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `https://event.transmetatek.com/auth/oauth/google/callback`
5. Copy Client ID and Client Secret and set:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://event.transmetatek.com/auth/oauth/google/callback
```

> **Note:** The default admin account is `edmundsitumorang@gmail.com` — the first user with this email to sign in will automatically be promoted to admin.

**Email (SMTP):**
Using Hostinger for transmetatek.com:
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@transmetatek.com
SMTP_PASS=your-email-password
MAIL_FROM=Event Management <noreply@transmetatek.com>
```

> **Note:** Find your email password in Hostinger hPanel → Emails → Manage → Connect Apps & Devices

### 4. Configure Domain

1. In Coolify, go to the application settings
2. **Domains:** Add `event.transmetatek.com`
3. Enable SSL/TLS (Coolify can auto-generate via Let's Encrypt)
4. Save and deploy

### 5. Deploy

1. Click **Deploy** in Coolify
2. Watch the build logs (should take 2-5 minutes)
3. Once successful, visit `https://event.transmetatek.com`

## Post-Deployment

### Database Persistence

The Docker setup uses a `data` directory for the SQLite database. To ensure persistence:

1. In Coolify, configure a **volume** mount:
   - Mount point: `/app/data`
   - Volume name: `event-management-db`
   - Host path: `/mnt/data` (or your preferred path)

This ensures the database survives container restarts.

### Verify Deployment

After deployment, verify:

1. ✅ App is accessible at `event.transmetatek.com`
2. ✅ Database was initialized (check logs for "migrations applied")
3. ✅ Email sending works (test with your configured SMTP)
4. ✅ HTTPS is working

### Troubleshooting

**Build fails with "better-sqlite3" error:**
- This is a native module that requires compilation
- The Dockerfile includes build dependencies (python3, make, g++)
- Check the build logs for compilation errors

**Database migration fails:**
- Check that `DATABASE_URL` is set correctly
- Ensure the `/app/data` volume is mounted and writable
- View logs: `docker logs <container-id>`

**Email not working:**
- Verify SMTP credentials in environment variables
- Check firewall rules allow outbound SMTP (port 587 or 25)
- Test with `nodemailer` directly if needed

## Updates & Redeployment

To redeploy after code changes:

1. Push to GitHub
2. In Coolify, click **Deploy** again
3. The new Docker image will be built and deployed

## Rollback

To rollback to a previous version:

1. In Coolify, view **Deployments**
2. Click on a previous deployment
3. Click **Redeploy**

---

For more Coolify help: https://coolify.io/docs
