# WallPay MVP

A complete iOS lock-screen ad platform with native app, web portals, and automated wallpaper rotation.

## 🎯 Project Overview

WallPay allows users to discover and set premium brand wallpapers on their iOS devices. Brands upload wallpapers through a web portal, superadmins curate daily lineups, and users browse and set wallpapers through a native iOS app.

### Core Features
- **Native iOS App**: Browse today's wallpapers, set via Apple Shortcut, view history
- **Brand Portal**: Upload wallpapers, track real-time analytics
- **Superadmin Dashboard**: Approve wallpapers, schedule daily rotations, view global stats
- **Automated Rotation**: Daily cron updates wallpaper lineup at 00:00 UTC

## 📁 Project Structure

```
WallPay/
├── ios-app/              # Native iOS app (Swift + SwiftUI)
├── web/                  # Next.js web portal (brands + superadmin)
├── supabase/            # Database schema, Edge Functions
├── shortcuts/           # Apple Shortcut instructions
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Supabase Backend Setup

```bash
cd supabase
```

Follow instructions in `supabase/README.md`:
1. Create Supabase project
2. Run `schema.sql` in SQL Editor
3. Create storage bucket for wallpapers
4. Deploy Edge Function for daily rotation
5. Set up cron trigger

### 2. Web Portal Setup

```bash
cd web
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Run development server:
```bash
npm run dev
```

Access at `http://localhost:3000`:
- Brand portal: `/brand/login`
- Superadmin: `/admin/login`

### 3. iOS App Setup

Requirements:
- macOS with Xcode 15+
- iOS 16+ device or simulator

```bash
cd ios-app
```

1. Open project in Xcode (you'll need to create an Xcode project manually and add all `.swift` files)
2. Update `Config.swift` with Supabase credentials
3. Add Supabase Swift package dependency
4. Build and run (⌘R)

### 4. Install Apple Shortcut

See `shortcuts/SHORTCUT-README.md` for detailed instructions.

## 🔄 Complete User Flow

1. **Superadmin** logs into `/admin/login`
2. **Superadmin** approves brand wallpapers at `/admin/pending`
3. **Superadmin** selects 8-15 wallpapers for tomorrow at `/admin/schedule`
4. **Cron** activates selected wallpapers at 00:00 UTC
5. **User** opens iOS app and sees today's wallpapers
6. **User** taps "Set Wallpaper" → image copied to clipboard → Shortcut opens
7. **Shortcut** sets Lock Screen + Home Screen wallpapers
8. **Analytics** event logged to Supabase
9. **Brand** views real-time stats at `/brand/wallpapers`

## 📊 Tech Stack

### iOS App
- **Swift** 5.9+
- **SwiftUI** for UI
- **Supabase Swift SDK** for backend
- **iOS 16+** for Shortcuts integration

### Web Portal
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling (v4 with @import)
- **Supabase JS** for data & auth

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Real-time + Edge Functions)
- **Row Level Security (RLS)** for data protection
- **Edge Functions (Deno)** for cron jobs

## 🎨 Design System

### Colors
- Background: `#0a0a0a`
- Card Background: `#1a1a1a`
- Border: `#2a2a2a`
- Accent Yellow: `#FBBF24`
- Accent Orange: `#F97316`

### Theme
- Dark mode by default
- Yellow/orange gradient accents
- Clean, modern iOS-inspired design

## 🔐 Security

- **RLS Policies**: Users can only see their own data
- **Role-based Access**: `user`, `brand`, `superadmin` roles
- **Anon Key**: Safe for client-side use (RLS enforced)
- **Service Role**: Only used in Edge Functions (server-side)

## 📝 Development Notes

### Database Schema
- `users`: Auth + role info
- `wallpapers`: Brand uploads with approval status
- `daily_wallpaper_selections`: Scheduled wallpapers per date
- `analytics_events`: Wallpaper set tracking

### API Endpoints (Supabase)
- `get_todays_wallpapers()`: RPC function for iOS app
- `get_wallpaper_stats(wallpaper_uuid, days_back)`: Analytics aggregation

### Real-time Features
- Brand portal shows live set counts via Supabase subscriptions
- Admin analytics updates in real-time

## 🧪 Testing Checklist

- [ ] Create superadmin user in Supabase
- [ ] Brand can sign up and upload wallpaper
- [ ] Superadmin can approve/reject wallpapers
- [ ] Superadmin can schedule 8-15 wallpapers for tomorrow
- [ ] Manual cron trigger activates wallpapers
- [ ] iOS app shows today's wallpapers
- [ ] "Set Wallpaper" opens Shortcut and sets wallpaper
- [ ] Analytics event logged
- [ ] Brand sees updated stats in real-time
- [ ] User can view history in profile

## 🚢 Deployment

### Web Portal (Vercel)
```bash
cd web
vercel deploy
```

Add environment variables in Vercel dashboard.

### iOS App (TestFlight)
1. Archive app in Xcode
2. Upload to App Store Connect
3. Create TestFlight build
4. Share link with testers

### Supabase
- Already cloud-hosted
- Deploy Edge Functions: `supabase functions deploy daily-rotation`
- Set up cron via pg_cron or external service

## 📚 Additional Documentation

- `/supabase/README.md` - Backend setup guide
- `/ios-app/README.md` - iOS development guide
- `/shortcuts/SHORTCUT-README.md` - Shortcut installation
- `/web/ENV_SETUP.md` - Environment configuration

## ⚠️ MVP Limitations

- No payment processing (coming in future version)
- No budget/wallet system
- Manual Shortcut installation required (Apple limitation)
- No push notifications
- No wallpaper scheduling UI calendar view

## 🆘 Troubleshooting

**iOS app won't build:**
- Ensure Xcode 15+ installed
- Check Swift package dependencies resolved
- Clean build folder (⇧⌘K)

**Web portal Supabase errors:**
- Verify `.env.local` credentials
- Check RLS policies in Supabase dashboard
- Ensure user has correct role

**Wallpapers not showing in app:**
- Check if wallpapers scheduled for today
- Verify `get_todays_wallpapers()` function exists
- Test function in Supabase SQL Editor

**Daily rotation not working:**
- Test Edge Function manually via curl
- Check cron schedule (00:00 UTC)
- Verify `CRON_SECRET` set correctly

## 👥 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **user** | View today's wallpapers, set wallpapers, view own history |
| **brand** | Upload wallpapers, view own submissions, see analytics |
| **superadmin** | Approve/reject wallpapers, schedule daily lineup, view global analytics |

## 📄 License

MIT (or your preferred license)

---

Built with ❤️ for WallPay MVP
