# WallPay MVP Deployment Guide

Complete guide for deploying WallPay to production.

## Prerequisites

- Supabase account
- Vercel account (for web portal)
- Apple Developer account (for iOS TestFlight)
- macOS with Xcode 15+ (for iOS build)

---

## 1. Supabase Deployment

### Create Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and set project name: `wallpay`
4. Set database password (save securely!)
5. Choose region (closest to your users)
6. Wait for project to provision (~2 minutes)

### Run Database Schema

1. Navigate to **SQL Editor**
2. Create new query
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Verify tables created in **Table Editor**

### Create Storage Bucket

1. Navigate to **Storage**
2. Click "New Bucket"
3. Name: `wallpapers`
4. Make it **Public**
5. Click "Save"

### Set Storage Policies

In the **Policies** tab for the `wallpapers` bucket:

**SELECT (Public Read):**
```sql
CREATE POLICY "Public wallpaper access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wallpapers');
```

**INSERT (Authenticated):**
```sql
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wallpapers');
```

### Deploy Edge Function

```bash
# Install Supabase CLI  
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
supabase functions deploy daily-rotation --no-verify-jwt
```

### Set Edge Function Secrets

```bash
# Generate a random secret
CRON_SECRET=$(openssl rand -hex 32)

# Set in Supabase
supabase secrets set CRON_SECRET=$CRON_SECRET
```

### Set Up Cron Trigger

**Option A: Using pg_cron (if available):**

Run in SQL Editor:
```sql
SELECT cron.schedule(
  'daily-wallpaper-rotation',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  ) $$
);
```

**Option B: Using external service (cron-job.org):**

1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add new cron job:
   - **Title**: WallPay Daily Rotation
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation`
   - **Schedule**: `0 0 * * *` (daily at midnight UTC)
   - **Headers**: Add `Authorization: Bearer YOUR_CRON_SECRET`
4. Save and enable

### Create Superadmin User

1. Navigate to **Authentication** → **Users**
2. Click "Add User"
3. Enter your email and password
4. Click "Create"
5. Copy the User ID
6. Go to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, role) 
VALUES ('PASTE_USER_ID_HERE', 'your-email@example.com', 'superadmin');
```

### Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key
   - **service_role secret** key (keep secure!)

---

## 2. Web Portal Deployment (Vercel)

### Prepare for Deployment

```bash
cd web

# Install Vercel CLI
npm install -g vercel

# Build locally to test
npm run build
```

### Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Scope: Your account
# - Link to existing project: No
# - Project name: wallpay
# - Directory: ./
# - Override settings: No
```

### Set Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
4. Click **Save**

### Deploy to Production

```bash
vercel --prod
```

Your web portal is now live at `https://wallpay.vercel.app`!

---

## 3. iOS App Deployment

### Create Xcode Project

1. Open Xcode
2. File → New → Project
3. Choose "App" template
4. Set:
   - **Product Name**: WallPay
   - **Team**: Your Apple Developer team
   - **Organization Identifier**: com.yourcompany
   - **Interface**: SwiftUI
   - **Language**: Swift
5. Save in `ios-app/` directory

### Add Swift Files

Manually add all `.swift` files from `ios-app/WallPay/`:
1. Select project in navigator
2. Right-click → Add Files to "WallPay"
3. Select all Swift files
4. Ensure "Copy items if needed" is checked

### Add Supabase Dependency

1. Select project in navigator
2. Select target → **General** → **Frameworks, Libraries, and Embedded Content**
3. Click **+** → **Add Package Dependency**
4. Enter: `https://github.com/supabase/supabase-swift`
5. Version: 2.0.0 or latest
6. Click **Add Package**

### Update Configuration

Edit `Config.swift`:
```swift
static let supabaseURL = "https://xxxxx.supabase.co"
static let supabaseAnonKey = "your-anon-key"
```

### Build and Archive

1. Select "Any iOS Device (arm64)" as destination
2. Product → Archive
3. Wait for build to complete
4. Distribute App → App Store Connect
5. Upload to App Store Connect

### Create TestFlight Build

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → **TestFlight**
3. Add build
4. Add internal testers
5. Share TestFlight link

---

## 4. Testing Deployment

### Test Web Portal

1. Visit your Vercel URL
2. Sign up as brand at `/brand/login`
3. Upload test wallpaper
4. Sign in as superadmin
5. Approve wallpaper
6. Schedule for today
7. Verify in brand portal

### Test iOS App

1. Install from TestFlight  
2. Sign up as user
3. Should see today's wallpapers
4. Tap "Set Wallpaper"
5. Shortcut should open
6. Check analytics in admin panel

### Test Daily Rotation

Manually trigger:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "result": {
    "date": "2024-XX-XX",
    "wallpapersActivated": 10,
    "wallpaperIds": [...]
  }
}
```

---

## 5. Post-Deployment Checklist

- [ ] Supabase database schema deployed
- [ ] Storage bucket created and configured
- [ ] Edge Function deployed and tested
- [ ] Cron job scheduled and verified
- [ ] Superadmin user created
- [ ] Web portal deployed to Vercel
- [ ] Environment variables set
- [ ] iOS app built and uploaded
- [ ] TestFlight link shared with testers
- [ ] End-to-end flow tested
- [ ] Analytics verified working
- [ ] Daily rotation tested

---

## Maintenance

### Monitor Edge Function

Check logs in Supabase:
```bash
supabase functions logs daily-rotation
```

### Update Web Portal

```bash
cd web
git pull
vercel --prod
```

### Update iOS App

1. Make changes
2. Increment version number
3. Archive and upload new build
4. Submit to TestFlight

### Database Migrations

For schema changes:
1. Create new migration file
2. Test locally
3. Run in production SQL Editor
4. Update app code accordingly

---

## Troubleshooting Deployment

**Supabase RLS errors:**
- Check policies in **Authentication** → **Policies**
- Verify user roles in `users` table

**Vercel build fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Test `npm run build` locally

**iOS build fails:**
- Clean build folder: ⇧⌘K
- Update Swift packages
- Check provisioning profiles

**Cron not triggering:**
- Verify cron schedule syntax
- Check Edge Function logs
- Test manual trigger with curl

---

## Security Best Practices

✅ **Do:**
- Keep service_role key secret (never commit)
- Use RLS policies for all tables
- Enable 2FA on Supabase/Vercel accounts
- Regularly rotate CRON_SECRET

⚠️ **Don't:**
- Commit `.env` files with real credentials
- Share service_role key with clients
- Disable RLS on production tables
- Use weak database passwords
