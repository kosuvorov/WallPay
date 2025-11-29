# WallPay MVP - Quick Start Guide

Get WallPay running in 30 minutes.

## Prerequisites

- [ ] Supabase account (free tier works)
- [ ] macOS with Xcode 15+ (for iOS app)
- [ ] Node.js 18+ installed

---

## Step 1: Supabase (10 minutes)

1. Create project at [supabase.com](https://supabase.com)
2. Copy `supabase/schema.sql` → Run in SQL Editor
3. Create storage bucket: "wallpapers" (public)
4. Get credentials from Settings → API:
   - Project URL
   - `anon` key
   - `service_role` key

### Create Superadmin

In SQL Editor:
```sql
-- First sign up via Auth UI, then:
INSERT INTO public.users (id, email, role) 
VALUES ('YOUR_USER_ID', 'admin@example.com', 'superadmin');
```

---

## Step 2: Web Portal (5 minutes)

```bash
cd web
npm install

# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY" >> .env.local

# Run
npm run dev
```

Visit `http://localhost:3000`

---

## Step 3: iOS App (10 minutes)

### Create Xcode Project

1. Open Xcode → New Project → App
2. Name: "WallPay", Interface: SwiftUI, Language: Swift
3. Save in `/ios-app/` folder

### Add Files

Drag all `.swift` files from `ios-app/WallPay/` into Xcode project

### Add Supabase Dependency

1. File → Add Package Dependencies
2. URL: `https://github.com/supabase/supabase-swift`
3. Version: 2.0.0+

### Configure

Edit `Config.swift`:
```swift
static let supabaseURL = "https://YOUR_PROJECT.supabase.co"
static let supabaseAnonKey = "YOUR_ANON_KEY"
```

Build & Run (⌘R)

---

## Step 4: Apple Shortcut (3 minutes)

On your iPhone:

1. Open **Shortcuts** app
2. Create new shortcut
3. Add actions:
   - Get Clipboard
   - Set Wallpaper (Lock Screen, no preview)
   - Set Wallpaper (Home Screen, no preview)
4. Rename to: **"WallPay Set"**
5. Save

---

## Step 5: Test (5 minutes)

### Web Portal

1. Go to `/admin/login` → sign in as superadmin
2. Go to `/brand/login` → create brand account
3. Upload wallpaper (any 2 images)
4. As admin: approve at `/admin/pending`
5. Schedule for today at `/admin/schedule` (select 8-15)

### iOS App

1. Sign up in app
2. View today's wallpapers
3. Tap "Set Wallpaper"
4. Shortcut should open and set wallpaper
5. Check history in Profile tab

### Verify Analytics

- Brand portal: View stats for wallpaper
- Admin dashboard: See total sets today

---

## Optional: Deploy Edge Function

```bash
npm install -g supabase
supabase login
supabase functions deploy daily-rotation --project-ref YOUR_PROJECT_REF

# Set secret
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
```

---

## Troubleshooting

**Web portal shows Supabase errors:**
→ Check `.env.local` credentials

**iOS build fails:**
→ Clean build folder (⇧⌘K), resolve packages

**No wallpapers in app:**
→ Ensure wallpapers scheduled for **today** in admin panel

**Shortcut doesn't open:**
→ Verify name is exactly "WallPay Set" (case-sensitive)

---

## What's Next?

- Read [DEPLOYMENT.md](file:///Users/konstantin.suvorov/WallPay/DEPLOYMENT.md) for production deployment
- Check [README.md](file:///Users/konstantin.suvorov/WallPay/README.md) for full documentation
- Review [walkthrough.md](file:///Users/konstantin.suvorov/.gemini/antigravity/brain/6f20f396-4b01-48d6-b260-34dfabc0e621/walkthrough.md) for implementation details

---

**Need help?** All documentation is in the project root:
- `README.md` - Complete overview
- `DEPLOYMENT.md` - Production deployment
- `supabase/README.md` - Backend setup
- `shortcuts/SHORTCUT-README.md` - Detailed Shortcut guide
