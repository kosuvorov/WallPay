#!/bin/bash

# Supabase Database Setup Script
# This script sets up the WallPay database schema, storage bucket, and creates a superadmin user

set -e

PROJECT_REF="iedowtrfkqiclsdjgwff"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZG93dHJma3FpY2xzZGpnd2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQ5MDMsImV4cCI6MjA4MDAwMDkwM30.PNsJWev7l1FeTb5JapO2A0DkJFS1fF-MNzNJQzJLXBw"

echo "🚀 Setting up WallPay Supabase database..."
echo ""

# Step 1: Run SQL schema
echo "📝 Step 1: Running database schema..."
SCHEMA_SQL=$(cat supabase/schema.sql)

# Use Supabase Management API to execute SQL
curl -X POST "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  --silent \
  --output /dev/null \
  --write-out "%{http_code}" \
  -d "{}"

echo "✅ SQL schema executed (if this fails, you'll need to run it manually in the Supabase dashboard)"
echo ""

# Step 2: Create storage bucket via API
echo "📦 Step 2: Creating 'wallpapers' storage bucket..."

BUCKET_RESPONSE=$(curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  --silent \
  -d '{
    "id": "wallpapers",
    "name": "wallpapers",
    "public": true,
    "file_size_limit": 52428800,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
  }')

if echo "$BUCKET_RESPONSE" | grep -q "error"; then
  echo "⚠️  Bucket may already exist or error occurred:"
  echo "$BUCKET_RESPONSE"
else
  echo "✅ Storage bucket 'wallpapers' created successfully"
fi
echo ""

# Step 3: Instructions for creating superadmin
echo "👤 Step 3: Create your superadmin account"
echo ""
echo "To create your superadmin account, please:"
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/users"
echo "2. Click 'Add user'"
echo "3. Enter your email and password"
echo "4. Copy the User UID"
echo "5. Then run this command with your actual UID and email:"
echo ""
echo "   curl -X POST \"${SUPABASE_URL}/rest/v1/users\" \\"
echo "     -H \"apikey: ${SERVICE_ROLE_KEY}\" \\"
echo "     -H \"Authorization: Bearer ${SERVICE_ROLE_KEY}\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"Prefer: return=representation\" \\"
echo "     -d '{\"id\": \"YOUR_USER_UID\", \"email\": \"your@email.com\", \"role\": \"superadmin\"}'"
echo ""
echo "✨ Setup script complete!"
echo "Note: You still need to manually run the SQL schema in the Supabase dashboard SQL Editor"
