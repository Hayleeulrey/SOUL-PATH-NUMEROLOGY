# Test 1.1: Create Unclaimed Profile

## Steps to Test

### 1. Create a new family member profile

**Action:**
1. Sign in to the application
2. Navigate to the Lineage page
3. Click "Add Family Member" or use the family member management dialog
4. Fill in the form with:
   - First Name: "Test"
   - Last Name: "User"
   - Relationship: Select any relationship (e.g., "Parent", "Sibling", "Child") - this makes it unclaimed
   - (Optional: Add birth date, location, etc.)
   - **Email (Optional)**: You can add an email to send an invitation, or leave blank
5. Submit the form

**Expected Result:**
- Profile is created successfully
- You see a success message or the profile appears in the list
- Profile should be unclaimed (userId = null, isClaimed = false)

---

### 2. Verify `isClaimed` is `false` by default

**Action:**
Check the database directly or verify via API:

**Option A - Using Prisma Studio:**
1. Open Prisma Studio (should be running on http://localhost:5555)
2. Navigate to `family_members` table
3. Find the newly created profile
4. Check the `isClaimed` field

**Option B - Using API:**
```bash
# Get the family member ID from the UI, then:
curl http://localhost:3000/api/family-members | jq '.data[] | select(.firstName == "Test") | {id, isClaimed, createdBy}'
```

**Expected Result:**
- `isClaimed` field should be `false`
- `claimedAt` field should be `null`

---

### 3. Verify `createdBy` field is set to creator's userId

**Action:**
In Prisma Studio or via API, check the `createdBy` field

**Expected Result:**
- `createdBy` should match your current user's Clerk userId
- You can verify your userId by checking the browser console or Clerk dashboard

---

### 4. Verify profile shows "Pending Claim" badge

**Action:**
1. View the profile in the family member list
2. Open the full profile dialog for this member
3. Check the header area

**Expected Result:**
- You should see a badge that says "Pending Claim" with a clock icon
- The badge should be amber/yellow colored
- The badge should appear next to the profile name in the dialog header

---

## Verification Checklist

- [ ] Profile created successfully
- [ ] `isClaimed` = `false` in database
- [ ] `claimedAt` = `null` in database  
- [ ] `createdBy` = current user's userId
- [ ] "Pending Claim" badge visible in UI
- [ ] Badge has correct styling (amber/yellow)

---

## Notes

- If the profile is created with `userId` set (meaning it's your own profile), it will be automatically claimed
- To create an unclaimed profile, make sure `userId` is `null` when creating
- The `createdBy` field helps track who originally created the profile for permission purposes

---

## Next Test

Once this test passes, proceed to **Test 1.2: Send Invitation**

