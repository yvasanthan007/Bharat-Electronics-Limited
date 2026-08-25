# Supabase Setup for BEL Digital Trust Platform

This directory contains the database schema and seed data for the BEL platform.

## 1. Local Setup or Remote Setup

If you are using a hosted Supabase project:
1. Go to your Supabase project dashboard -> SQL Editor.
2. Copy and run the contents of `migrations/01_schema.sql`.
3. Go to Authentication -> Users, and manually create the manager account:
   - Email: `belmanager@gmail.com`
   - Password: `manager123`
4. Copy and run the contents of `seed.sql` in the SQL Editor to populate the rest of the mock data and link it to the newly created manager account.

If you are using the Supabase CLI locally:
```bash
supabase init
supabase start
supabase db reset
```

## 2. Environment Variables

Create a `.env` file in the root of your React project (outside this folder) and add your keys:

```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```
