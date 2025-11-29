# 🚀 WallPay Deployment - Final Steps

Your WallPay app is configured and ready to deploy! Follow these steps:

---

## ✅ Already Completed

- ✅ Next.js app built successfully
- ✅ Environment variables configured with your Supabase credentials
- ✅ iOS app Config.swift updated with your API keys

---

## Step 1: Deploy Web Portal to Vercel (5 minutes)

Open Terminal and run these commands:

```bash
cd ~/WallPay/web

# Login to Vercel (will open browser)
npx vercel login

# Deploy to production
npx vercel --prod
```

**During deployment:**
1. If asked "Set up and deploy", type: `y`
2. If asked for scope, select your account
3. If asked "Link to existing project", type: `n`
4. Project name: `wallpay` (or your preference)
5. Directory: just press Enter (uses current directory)
6. Override settings: `n`

**After deployment completes**, you'll see:
```
✅ Production: https://wallpay-xxxxx.vercel.app
```

**IMPORTANT:** Copy this URL - this is your live web portal!

### Set Environment Variables in Vercel

After first deployment:

```bash
# Set environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://iedowtrfkqiclsdjgwff.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZG93dHJma3FpY2xzZGpnd2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQ5MDMsImV4cCI6MjA4MDAwMDkwM30.PNsJWev7l1FeTb5JapO2A0DkJFS1fF-MNzNJQzJLXBw

# Redeploy with env vars
npx vercel --prod
```

---

## Step 2: Setup Supabase Database (10 minutes)

Follow the guide in `SUPABASE_SETUP_STEPS.md` or these quick steps:

### 2.1 Run Database Schema

1. Go to: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/editor
2. Click **SQL Editor** → **New Query**
3. Copy ENTIRE contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Should see: "Success. No rows returned"

### 2.2 Create Storage Bucket

1. Click **Storage** in sidebar
2. Click **New Bucket**
3. Name: `wallpapers`
4. Make it **Public** ✓
5. Click **Save**

### 2.3 Create Superadmin Account

1. Click **Authentication** → **Add user**
2. Enter your email + password (save this!)
3. Click **Create user**
4. Copy the **User UID** (looks like: `a1b2c3...`)
5. Go to **SQL Editor** and run (replace UID and email):

```sql
INSERT INTO public.users (id, email, role) 
VALUES ('PASTE_YOUR_USER_UID_HERE', 'youremail@example.com', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
```

---

## Step 3: Setup iOS App in Xcode (10 minutes)

### 3.1 Create Xcode Project

1. Open **Xcode**
2. File → New → Project
3. Choose **App** template → Next
4. Fill in:
   - Product Name: `WallPay`
   - Team: Select your team
   - Organization Identifier: `com.yourname` or similar
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Click Next
5. Save in: `~/WallPay/ios-app/` folder
6. Click **Create**

### 3.2 Add Swift Files to Project

In Xcode:
1. Delete the auto-created `ContentView.swift` file (if exists)
2. Right-click on "WallPay" folder in Project Navigator
3. Select **Add Files to "WallPay"...**
4. Navigate to `~/WallPay/ios-app/WallPay/`
5. Select ALL folders: `WallPayApp.swift`, `Config.swift`, `Theme/`, `Models/`, `Services/`, `Views/`
6. ✓ Check "Copy items if needed"
7. ✓ Check "Create groups"
8. Click **Add**

### 3.3 Add Supabase Package

1. Select project in navigator
2. Select **WallPay** target
3. Go to **General** tab
4. Scroll to **Frameworks, Libraries, and Embedded Content**
5. Click **+** button
6. Click **Add Package Dependency**
7. Paste URL: `https://github.com/supabase/supabase-swift`
8. Version: **2.0.0** (or latest)
9. Click **Add Package**
10. Select **Supabase** library
11. Click **Add Package**

### 3.4 Build and Run

1. Select target: **iPhone SE (3rd generation)** simulator (or your iOS 16.1 simulator)
2. Click **Run** button (▶) or press **⌘R**
3. Wait for build...
4. App should launch in simulator!

---

## Step 4: Create Apple Shortcut (Simulator)

**Note:** Shortcuts work best on real devices, but you can test the flow in simulator:

1. Open **Shortcuts** app in simulator
2. Tap **+** to create new shortcut
3. Add these actions:
   - Search "Get Clipboard"
   - Search "Set Wallpaper" → choose Lock Screen, turn OFF preview
   - Search "Set Wallpaper" → choose Home Screen, turn OFF preview
4. Tap shortcut name → rename to: **WallPay Set**
5. Tap **Done**

---

## 🎉 Test Everything!

### Test 1: Web Portal

1. Open your Vercel URL in browser
2. Go to `/admin/login`
3. Login with the email/password you created in Supabase
4. You should see the Admin Dashboard!

### Test 2: Upload Wallpaper as Brand

1. In browser, go to `/brand/login`
2. Create a new brand account
3. Go to Upload page
4. Upload any 2 images (they'll be treated as different resolutions)
5. Should show "Pending"

### Test 3: Approve as Admin

1. Login as superadmin
2. Go to `/admin/pending`
3. Click **Approve** on the wallpaper
4. Go to `/admin/schedule`
5. Select today's date
6. Click on 8-15 wallpapers to select them
7. Click **Save Schedule**

### Test 4: iOS App

1. In simulator, sign up as a user
2. You should see today's wallpapers!
3. Tap "Set Wallpaper" on any wallpaper
4. It will copy to clipboard and try to open Shortcut
5. Check Profile tab to see history

---

## 📍 Your URLs

Once deployed, you'll have:

- **Web Portal**: `https://wallpay-xxxxx.vercel.app`
  - Brand Portal: `/brand/login`
  - Admin Dashboard: `/admin/login`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff
- **iOS App**: Running in Xcode simulator

---

## 🆘 Troubleshooting

**Vercel won't deploy:**
- Make sure you're logged in: `npx vercel login`
- Try: `npx vercel --prod --force`

**Supabase schema errors:**
- If tables already exist, that's OK
- Make sure you copy the ENTIRE schema.sql file

**iOS build fails:**
- Clean build: ⇧⌘K
- Make sure all Swift files are added to target
- Check Supabase package is installed

**No wallpapers in app:**
- Make sure wallpapers are scheduled for **today**
- Check iOS app is connecting to Supabase (check logs)

**Shortcut doesn't work in simulator:**
- This is expected - Shortcuts work better on real devices
- The app flow still works (clipboard copy, analytics logging)

---

## ✨ Next Steps

Once everything is working:

1. Deploy to real iPhone for full Shortcut testing
2. Invite brands to upload wallpapers
3. Set up daily cron for automatic rotation (see DEPLOYMENT.md)
4. Monitor analytics in admin dashboard

---

**Need help?** All commands are ready to copy-paste above! 🚀
