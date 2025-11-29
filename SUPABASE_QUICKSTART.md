# ⚡ Super Quick Supabase Setup (2 Minutes!)

I need you to run just **ONE SQL command** in your Supabase dashboard. That's it!

## Step 1: Copy the SQL Schema (it's right here!)

Click this file to open it: [schema.sql](file:///Users/konstantin.suvorov/WallPay/supabase/schema.sql)

Or just use the command below to copy it to your clipboard:

```bash
cat ~/WallPay/supabase/schema.sql | pbcopy
```

## Step 2: Run it in Supabase (30 seconds)

1. Go to: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/sql/new
2. The SQL will already be in your clipboard - just **Paste** (⌘V)
3. Click **Run** (or press ⌘Enter)
4. You'll see: "Success. No rows returned" ✅

**That's it! The database is ready!** 🎉

---

## Step 3: Create Storage Bucket (30 seconds)

1. Go to: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/storage/buckets
2. Click **New bucket**
3. Name: `wallpapers`
4. Toggle **Public bucket** ON ✓
5. Click **Save**

---

## Step 4: Create Your Superadmin Account (1 minute)

1. Go to: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/auth/users
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: (your email)
   - Password: (choose a password - remember it!)
4. Click **Create user**
5. **Copy the User UID** (looks like: `a1b2c3d4-e5f6...`)

6. Go back to SQL Editor: https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/sql/new
7. Paste this (replace with your UID and email):

```sql
INSERT INTO public.users (id, email, role) 
VALUES ('YOUR_USER_UID_HERE', 'your-email@example.com', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
```

8. Click **Run**

---

## ✅ Done! Now Test It

Your web portal is already live at:
**https://web-gp15yt801-kosuvorov-wallpay.vercel.app**

1. Go to: **/admin/login**
2. Login with your email and password
3. You should see the Admin Dashboard! 🎉

---

## Quick Commands (Copy-Paste)

**Copy SQL to clipboard:**
```bash
cat ~/WallPay/supabase/schema.sql | pbcopy
```

**Open Supabase SQL Editor:**
```bash
open "https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/sql/new"
```

**Open Supabase Storage:**
```bash
open "https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/storage/buckets"
```

**Open Auth Users:**
```bash
open "https://supabase.com/dashboard/project/iedowtrfkqiclsdjgwff/auth/users"
```

---

That's literally it - 3 quick steps in the Supabase dashboard and you're done! 🚀
