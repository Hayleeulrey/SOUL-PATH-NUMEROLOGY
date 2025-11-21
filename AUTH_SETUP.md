# Authentication Setup Instructions

## Overview
Your application now has Clerk authentication integrated. This provides:
- Secure user authentication
- Data isolation between users
- User management UI
- Protected routes

## Next Steps to Complete Setup

### 1. Create Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys
1. In the Clerk Dashboard, go to "API Keys"
2. Copy your publishable key (starts with `pk_test_`)
3. Copy your secret key (starts with `sk_test_`)

### 3. Update Environment Variables
Edit `/Users/hayleeulrey/SOUL-PATH-NUMEROLOGY/.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

### 4. Configure Clerk Dashboard
1. In Clerk Dashboard → "Paths"
2. Set "Sign in path" to: `/sign-in`
3. Set "Sign up path" to: `/sign-up`
4. Set "After sign-in URL" to: `/lineage`
5. Set "After sign-up URL" to: `/lineage`

### 5. Test the Authentication
1. Run `npm run dev`
2. Visit `http://localhost:3000/lineage`
3. You should be redirected to sign-in
4. Create an account and test the flow

## What's Been Added

### New Files
- `middleware.ts` - Protects routes and redirects unauthenticated users
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
- `.env.local` - Environment variables (needs your keys)

### Modified Files
- `app/layout.tsx` - Added ClerkProvider
- `components/shared/header.tsx` - Added user button
- `app/api/family-members/route.ts` - Filters by userId
- `app/api/photos/route.ts` - Verifies ownership
- `app/api/audio/route.ts` - Verifies ownership
- `app/api/documents/route.ts` - Verifies ownership
- `app/api/relationships/route.ts` - Verifies ownership

## Route Protection

### Public Routes (No Auth Required)
- `/` - Numerology calculator
- `/sacred-science` - Educational content
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

### Protected Routes (Auth Required)
- `/lineage` - Family lineage features
- `/api/*` - All API endpoints

## Features Enabled

✅ User authentication with Clerk
✅ Data isolation per user
✅ Protected family member data
✅ Protected media uploads
✅ Protected relationships
✅ User profile management
✅ Sign in/out functionality

## Notes

- The database already has `userId` fields in the schema
- Existing data without userId will still be visible but new data requires auth
- All API routes now require authentication
- Middleware automatically redirects unauthenticated users to sign-in

## Troubleshooting

### "Clerk key required" error
- Make sure `.env.local` has your actual Clerk keys
- Restart the dev server after adding keys

### Can't access protected routes
- This is expected! You need to sign in first
- Visit `/lineage` to be redirected to sign-in

### TypeScript errors about userId
- Run `npx prisma generate` to regenerate types
- The userId field exists in schema but types may need refresh
