# WallPay Supabase Backend Setup

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Install Supabase CLI: `npm install -g supabase`

## Database Setup

### 1. Run the Schema

Copy the contents of `schema.sql` and run it in your Supabase SQL Editor:
1. Go to your project at app.supabase.com
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the entire `schema.sql` contents
5. Click **Run**

### 2. Create Your First Superadmin User

1. Go to **Authentication** → **Users**
2. Create a new user with your email
3. Copy the User ID
4. Go back to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, role) 
VALUES ('YOUR_USER_ID_HERE', 'your-email@example.com', 'superadmin');
```

### 3. Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `wallpapers`
3. Make it **public**
4. Set the following policies:
   - **SELECT**: Allow public reads
   - **INSERT**: Allow authenticated uploads (or brand role only)
   - **DELETE**: Superadmin only

## Edge Functions Setup

### 1. Initialize Supabase Locally (Optional for Testing)

```bash
supabase init
supabase start
```

### 2. Deploy the Daily Rotation Function

```bash
cd supabase/functions
supabase functions deploy daily-rotation --no-verify-jwt
```

### 3. Set Environment Variables

In your Supabase project dashboard:
1. Go to **Edge Functions** → **daily-rotation**
2. Add these secrets:
   - `CRON_SECRET`: A random string for authentication

### 4. Set Up Cron Trigger

In your Supabase dashboard:
1. Go to **Database** → **Webhooks** (if available) OR use an external cron service
2. **Option A**: Use Supabase's pg_cron (if available):

```sql
SELECT cron.schedule(
  'daily-wallpaper-rotation',
  '0 0 * * *', -- Every day at 00:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  )
  $$
);
```

3. **Option B**: Use external cron services like:
   - [cron-job.org](https://cron-job.org)
   - GitHub Actions
   - Vercel Cron (if deploying web portal on Vercel)

Configure to call:
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation
Header: Authorization: Bearer YOUR_CRON_SECRET
```

## Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret!)

## Testing

Test the daily rotation function manually:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-rotation \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files with real credentials
- Keep `service_role` key secret - it bypasses RLS!
- Use `anon` key for client-side applications
- Use `service_role` key only in Edge Functions and secure backend code
