# Supabase Database Setup Script

Follow these steps in your Supabase project dashboard:

## Step 1: Run Database Schema

1. Go to https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the ENTIRE contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press Cmd/Ctrl + Enter
7. You should see: "Success. No rows returned"

## Step 2: Create Storage Bucket

1. Click on **Storage** in the left sidebar
2. Click **New Bucket**
3. Enter name: `wallpapers`
4. Set as **Public bucket** (toggle ON)
5. Click **Save**

## Step 3: Set Storage Policies

1. Stay in **Storage** → Click on `wallpapers` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **For full customization**

**Policy 1: Public Read Access**
- Policy name: `Public wallpaper access`
- Target role: `public`
- Operation: `SELECT`
- Policy definition:
```sql
(bucket_id = 'wallpapers'::text)
```

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated upload`
- Target role: `authenticated`
- Operation: `INSERT`
- Policy definition:
```sql
(bucket_id = 'wallpapers'::text)
```

## Step 4: Create Your Superadmin Account

1. Click on **Authentication** in the left sidebar
2. Click **Add user** → **Create new user**
3. Enter your email and a password (save this!)
4. Click **Create user**
5. Copy the **User UID** (looks like: a1b2c3d4-...)
6. Go back to **SQL Editor** and run this (replace the UID and email):

```sql
INSERT INTO public.users (id, email, role) 
VALUES ('PASTE_YOUR_USER_UID_HERE', 'your-email@example.com', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
```

## Verification

After completing these steps, verify in **Table Editor**:
- You should see tables: `users`, `wallpapers`, `daily_wallpaper_selections`, `analytics_events`
- Check **Storage**: `wallpapers` bucket should exist
- Check **Authentication**: Your user should exist
- Check **users** table: Your user should have role = 'superadmin'

## Troubleshooting

**"relation already exists" errors:**
- Some tables may already exist, this is OK. The schema will update them.

**"permission denied" errors:**
- Make sure you're running as the project owner
- Check that RLS is enabled on tables

**Can't create storage policies:**
- Make sure bucket is created first
- Try the simple toggle options instead of custom SQL

---

Once complete, you can:
1. Login to the web portal as superadmin
2. Start testing the full flow!
