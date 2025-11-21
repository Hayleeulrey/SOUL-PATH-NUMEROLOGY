# Testing Guide - Step 1: Create Unclaimed Profile

## Overview
This guide will walk you through testing **Test 1.1: Create Unclaimed Profile** from the testing checklist.

## Prerequisites
- ✅ Development server is running (`npm run dev`)
- ✅ You are signed in to the application
- ✅ Database is accessible (Prisma Studio optional but helpful)

---

## Step-by-Step Testing

### Step 1: Create an Unclaimed Profile

1. **Navigate to Lineage Page**
   - Go to `http://localhost:3000/lineage`
   - You should see the family member management interface

2. **Open Add Family Member Dialog**
   - Click the "Add Family Member" button or similar
   - A dialog/form should open

3. **Fill in the Form**
   - **First Name**: `Test`
   - **Last Name**: `Unclaimed`
   - **Relationship**: Select any relationship type (e.g., "Parent", "Sibling", "Child")
     - ⚠️ **Important**: Selecting a relationship makes this an unclaimed profile
   - **Birth Date** (optional): `1990-01-01`
   - **Email** (optional): Leave blank or add `test@example.com`
   - Leave other fields as default

4. **Submit the Form**
   - Click "Save" or "Add Family Member"
   - The profile should be created successfully

---

### Step 2: Verify Database Fields

**Option A: Using Prisma Studio** (Recommended)
1. Open `http://localhost:5555` (Prisma Studio)
2. Click on `family_members` table
3. Find the profile you just created (look for "Test Unclaimed")
4. Check these fields:
   - ✅ `isClaimed` should be `false`
   - ✅ `claimedAt` should be `null`
   - ✅ `userId` should be `null` (not set)
   - ✅ `createdBy` should be your Clerk userId (a string like `user_xxx`)

**Option B: Using Browser DevTools**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the lineage page
4. Find the request to `/api/family-members`
5. Check the response - find your "Test Unclaimed" profile
6. Verify the same fields as above

**Option C: Using Terminal**
```bash
# If you have the family member ID:
curl http://localhost:3000/api/family-members \
  -H "Cookie: your-session-cookie" \
  | jq '.data[] | select(.firstName == "Test") | {id, firstName, lastName, isClaimed, userId, createdBy}'
```

---

### Step 3: Verify UI Badge

1. **View the Profile in List**
   - The profile should appear in your family member list
   - Look for "Test Unclaimed"

2. **Open Full Profile Dialog**
   - Click on the profile card or name
   - The full profile dialog should open

3. **Check for Badge**
   - Look at the dialog header (top area with the profile name)
   - You should see a badge that says:
     - **"Pending Claim"** with a clock icon (🕐)
     - Badge should be amber/yellow colored
     - Should appear next to or below the profile name

4. **Verify Badge Styling**
   - Badge should have amber/yellow background
   - Text should be readable
   - Icon should be visible

---

## Expected Results Summary

| Field/Feature | Expected Value | How to Verify |
|--------------|----------------|---------------|
| `isClaimed` | `false` | Database/API |
| `claimedAt` | `null` | Database/API |
| `userId` | `null` | Database/API |
| `createdBy` | Your userId | Database/API |
| "Pending Claim" badge | Visible | UI - Profile dialog header |

---

## Troubleshooting

### Issue: Profile shows as claimed (`isClaimed = true`)
**Possible Causes:**
- You didn't select a relationship type
- The profile was created as your own profile
- **Fix**: Make sure to select a relationship type when creating

### Issue: Badge not showing
**Possible Causes:**
- Badge logic might not be working
- Profile might be claimed
- **Fix**: Check browser console for errors, verify `isClaimed = false` in database

### Issue: `createdBy` is null
**Possible Causes:**
- API didn't set the field correctly
- **Fix**: Check the API route - `createdBy` should always be set to the creator's userId

---

## Success Criteria

✅ All of these should be true:
- [ ] Profile created without errors
- [ ] `isClaimed = false` in database
- [ ] `userId = null` in database
- [ ] `createdBy = your userId` in database
- [ ] "Pending Claim" badge visible in UI
- [ ] Badge has correct styling (amber/yellow)

---

## Next Steps

Once all checks pass, you can proceed to:
- **Test 1.2**: Send Invitation
- Or continue with other tests from the checklist

---

## Notes

- Creating a profile **with a relationship type** makes it unclaimed (for someone else)
- Creating a profile **without a relationship type** makes it your own profile (claimed)
- The `createdBy` field is always set to track who originally created the profile
- This is important for permission checks later

