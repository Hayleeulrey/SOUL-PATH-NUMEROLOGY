# Complete Testing Walkthrough

## 🎯 Overview
This guide will walk you through testing the entire permission and content approval system step by step.

---

## ✅ Prerequisites Check

Before starting, verify:
- [ ] Server is running at `http://localhost:3000`
- [ ] You are signed in to the application
- [ ] Browser DevTools are open (F12) - Network tab will be helpful

---

## 📋 Test 1.1: Create Unclaimed Profile

### Step 1: Navigate to Lineage Page
1. Open your browser
2. Go to: `http://localhost:3000/lineage`
3. You should see the family member management interface

### Step 2: Open Add Family Member Dialog
1. Look for the **"Add Family Member"** button (usually at the top or in a prominent location)
2. Click it to open the dialog/form

### Step 3: Fill in the Form
Fill in these fields:
- **First Name**: `Test`
- **Last Name**: `Unclaimed`
- **Relationship**: **Select any relationship** (e.g., "Parent", "Sibling", "Child")
  - ⚠️ **CRITICAL**: You MUST select a relationship type - this makes it an unclaimed profile
- **Birth Date** (optional): `1990-01-01`
- **Email** (optional): Leave blank OR add `test@example.com`
- Leave other fields as default

### Step 4: Submit the Form
1. Click **"Save"** or **"Add Family Member"**
2. The profile should be created successfully
3. The dialog should close and the new profile should appear in your list

### Step 5: Verify Database Fields

**Option A: Using Browser DevTools (Easiest)**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page (F5)
4. Find the request to `/api/family-members`
5. Click on it and go to **Response** tab
6. Find your "Test Unclaimed" profile in the JSON
7. Verify:
   - ✅ `isClaimed: false`
   - ✅ `userId: null`
   - ✅ `createdBy: "user_xxx"` (your Clerk userId)
   - ✅ `claimedAt: null`

**Option B: Using Prisma Studio**
1. In a new terminal, run: `npx prisma studio`
2. Open `http://localhost:5555`
3. Click on `FamilyMember` table
4. Find "Test Unclaimed"
5. Check the same fields as above

### Step 6: Verify UI Badge
1. In the lineage page, find the **"Test Unclaimed"** profile card
2. **Click on the profile card** to open the full profile dialog
3. Look at the **dialog header** (top area with the profile name)
4. You should see:
   - ✅ **"Pending Claim"** badge with a clock icon (🕐)
   - ✅ Badge should be **amber/yellow** colored
   - ✅ Badge appears next to or below the profile name

### ✅ Test 1.1 Success Criteria
- [ ] Profile created without errors
- [ ] `isClaimed = false` in database/API response
- [ ] `userId = null` in database/API response
- [ ] `createdBy = your userId` in database/API response
- [ ] "Pending Claim" badge visible in UI
- [ ] Badge has correct styling (amber/yellow)

---

## 📋 Test 1.2: Send Invitation

### Step 1: Open the Unclaimed Profile
1. Go back to `/lineage`
2. Click on the **"Test Unclaimed"** profile you just created
3. The full profile dialog should open

### Step 2: Find the Invitation Section
1. Look for an **"Invite"** tab or section in the dialog
2. OR look for an email input field with a "Send Invitation" button
3. This should be in the dialog, possibly in a tab labeled "Invite" or "Settings"

### Step 3: Send the Invitation
1. Enter an email address: `test@example.com` (or your real email for testing)
2. Click **"Send Invitation"** or similar button
3. You should see a success message

### Step 4: Verify Invitation in Database
1. Check the database (Prisma Studio or API):
   - Go to `FamilyInvitation` table
   - Find the invitation for "Test Unclaimed"
   - Verify:
     - ✅ `status: "PENDING"`
     - ✅ `email: "test@example.com"`
     - ✅ `familyMemberId` matches the profile ID
     - ✅ `token` is generated (a long string)

### Step 5: Check Email (if Resend is configured)
- If you used a real email, check your inbox
- You should receive an invitation email with a claim link
- The link should look like: `http://localhost:3000/claim/[token]`

### ✅ Test 1.2 Success Criteria
- [ ] Invitation sent successfully
- [ ] Invitation record created in database
- [ ] Status is "PENDING"
- [ ] Token is generated
- [ ] Email sent (if configured)

---

## 📋 Test 1.3: Claim Profile (New User Flow)

### Step 1: Get the Invitation Token
1. From Test 1.2, copy the invitation token from the database
2. OR check your email for the claim link
3. The URL format is: `/claim/[token]`

### Step 2: Open Claim Page
1. Navigate to: `http://localhost:3000/claim/[your-token]`
2. You should see a page showing:
   - Profile preview (Test Unclaimed)
   - A **"Claim Profile"** button
   - Information about what claiming means

### Step 3: Sign Up/Sign In
1. If not signed in, you'll need to create an account or sign in
2. Use a different account than the one that created the profile (to simulate a new user)
3. OR use the same account but verify the claim process works

### Step 4: Claim the Profile
1. Click **"Claim Profile"** button
2. The profile should be claimed
3. You should be redirected to the review page (`/lineage/review`)

### Step 5: Verify Profile is Claimed
1. Check the database:
   - `FamilyMember` table
   - Find "Test Unclaimed"
   - Verify:
     - ✅ `isClaimed: true`
     - ✅ `userId` is now set (the new user's ID)
     - ✅ `claimedAt` has a timestamp

### Step 6: Check Review Page
1. After claiming, you should be on `/lineage/review`
2. This page should show:
   - Tabs for "Pending Approvals" and "Pending Tags"
   - Any existing content that needs approval
   - Since this is a new profile, there might not be much yet

### ✅ Test 1.3 Success Criteria
- [ ] Claim page loads with profile preview
- [ ] Profile can be claimed successfully
- [ ] `isClaimed = true` after claiming
- [ ] `userId` is set to the claiming user
- [ ] `claimedAt` has a timestamp
- [ ] Redirected to review page
- [ ] Review page loads correctly

---

## 📋 Test 2.1: Permission Checks - Edit Own Profile

### Step 1: Create Your Own Profile
1. Go to `/lineage`
2. Click "Add Family Member"
3. Fill in:
   - **First Name**: `My`
   - **Last Name**: `Profile`
   - **Relationship**: Leave blank OR select "SELF"
   - **Email**: Your email (optional)
4. Submit

### Step 2: Verify It's Claimed
1. Open the profile dialog
2. Check:
   - ✅ No "Pending Claim" badge
   - ✅ `isClaimed: true` in database
   - ✅ `userId` matches your current user ID

### Step 3: Try to Edit
1. In the profile dialog, click the **"Edit"** tab or button
2. Make a change (e.g., update the bio)
3. Save
4. Verify: ✅ Edit should work without restrictions

### ✅ Test 2.1 Success Criteria
- [ ] Own profile is automatically claimed
- [ ] Can edit own profile without restrictions
- [ ] No permission errors

---

## 📋 Test 2.2: Permission Checks - Edit Unclaimed Profile

### Step 1: Open Unclaimed Profile
1. Go back to the "Test Unclaimed" profile (from Test 1.1)
2. Open the full profile dialog

### Step 2: Verify Edit Permissions
1. Try to edit the profile (click Edit tab)
2. Verify:
   - ✅ You CAN edit (you're the creator)
   - ✅ Edit buttons are enabled
   - ✅ No permission warnings

### Step 3: Check as Different User
1. Sign out
2. Sign in with a different account
3. Try to access the "Test Unclaimed" profile
4. Verify:
   - ✅ You CANNOT edit (not the creator)
   - ✅ Edit buttons are disabled
   - ✅ Tooltip explains why

### ✅ Test 2.2 Success Criteria
- [ ] Creator can edit unclaimed profile
- [ ] Non-creator cannot edit unclaimed profile
- [ ] UI shows appropriate disabled states

---

## 📋 Test 2.3: Permission Checks - Edit Claimed Profile (Owner)

### Step 1: Claim a Profile (if not already claimed)
- Use the profile from Test 1.3, or create a new one and claim it

### Step 2: Sign In as Profile Owner
- Sign in as the user who claimed the profile

### Step 3: Try to Edit
1. Open the profile
2. Click Edit
3. Make changes
4. Save
5. Verify: ✅ Edit works (you're the owner)

### ✅ Test 2.3 Success Criteria
- [ ] Profile owner can edit their profile
- [ ] No permission errors

---

## 📋 Test 2.4: Permission Checks - Edit Claimed Profile (Non-Owner)

### Step 1: Sign In as Non-Owner
- Sign in as a user who did NOT claim the profile

### Step 2: Try to Edit
1. Open the claimed profile
2. Try to edit
3. Verify:
   - ✅ Edit buttons are disabled
   - ✅ Tooltip explains: "Only the profile owner or admins can edit"
   - ✅ Cannot save changes

### ✅ Test 2.4 Success Criteria
- [ ] Non-owner cannot edit claimed profile
- [ ] UI shows disabled state with explanation

---

## 📋 Test 3.1: Content Approval - Add Photo to Claimed Profile

### Step 1: Setup
- You need a claimed profile (not your own)
- Sign in as a user who is NOT the profile owner

### Step 2: Add a Photo
1. Open the claimed profile
2. Go to **"Photos"** tab
3. Click **"Upload Photo"** or **"Add Photo"**
4. Select an image file
5. Upload it

### Step 3: Verify Approval Record Created
1. Check database:
   - `ContentApproval` table
   - Find the approval for the photo
   - Verify:
     - ✅ `status: "PENDING"`
     - ✅ `contentType: "PHOTO"`
     - ✅ `contentId` matches the photo ID
     - ✅ `familyMemberId` matches the profile

### Step 4: Check Notification
1. Check database:
   - `Notification` table
   - Find notification for the profile owner
   - Verify:
     - ✅ `type: "CONTENT_PENDING_APPROVAL"`
     - ✅ `userId` is the profile owner's ID
     - ✅ `read: false`

### Step 5: Sign In as Profile Owner
1. Sign out
2. Sign in as the profile owner
3. Check the header notification bell
4. Verify:
   - ✅ Badge shows count > 0
   - ✅ Notification appears in dropdown

### ✅ Test 3.1 Success Criteria
- [ ] Photo uploaded successfully
- [ ] Approval record created with PENDING status
- [ ] Notification sent to profile owner
- [ ] Notification badge appears in header

---

## 📋 Test 3.2: Content Approval - Approve Content

### Step 1: Go to Review Page
1. Sign in as profile owner
2. Navigate to `/lineage/review`
3. OR click the notification bell and go to "Review"

### Step 2: View Pending Approvals
1. Click on **"Pending Approvals"** tab
2. You should see the photo from Test 3.1
3. Verify:
   - ✅ Photo preview is visible
   - ✅ Shows who created it
   - ✅ Shows creation date

### Step 3: Approve the Content
1. Click **"Approve"** button on the photo
2. Verify:
   - ✅ Photo is removed from pending list
   - ✅ Status changes to "APPROVED" in database
   - ✅ Photo is now visible in the profile

### Step 4: Verify in Database
1. Check `ContentApproval` table:
   - ✅ `status: "APPROVED"`
   - ✅ `approvedAt` has timestamp
   - ✅ `approvedBy` is set to your userId

### ✅ Test 3.2 Success Criteria
- [ ] Review page shows pending content
- [ ] Can approve content
- [ ] Approval updates database correctly
- [ ] Content becomes visible after approval

---

## 📋 Test 3.3: Content Approval - Deny Content

### Step 1: Add Another Photo
- Repeat Test 3.1 to add another photo (as non-owner)

### Step 2: Deny the Content
1. Go to `/lineage/review` as profile owner
2. Find the new pending photo
3. Click **"Deny"** button
4. Optionally add a reason

### Step 3: Verify Denial
1. Check database:
   - ✅ `status: "DENIED"`
   - ✅ `deniedAt` has timestamp
   - ✅ Photo is removed from profile (or marked as denied)

### ✅ Test 3.3 Success Criteria
- [ ] Can deny content
- [ ] Denial updates database correctly
- [ ] Content is removed/hidden after denial

---

## 📋 Test 4.1: Tagging - Tag Someone in Photo

### Step 1: Upload a Photo
1. Sign in as any user
2. Go to any profile (claimed or unclaimed)
3. Upload a photo

### Step 2: Tag People
1. After upload, look for a **"Tag People"** button or option
2. Click it
3. A dialog should open showing family members
4. Select one or more people to tag
5. Save tags

### Step 3: Verify Tags Created
1. Check database:
   - `ContentTag` table
   - Find tags for the photo
   - Verify:
     - ✅ `status: "PENDING"` (if profile is claimed)
     - ✅ `contentType: "PHOTO"`
     - ✅ `contentId` matches photo ID
     - ✅ `taggedMemberId` matches tagged person

### Step 4: Check Notifications
1. For each tagged person (if their profile is claimed):
   - Check `Notification` table
   - Verify notification was created
   - Type should be "TAG_PENDING_APPROVAL"

### ✅ Test 4.1 Success Criteria
- [ ] Can tag people in photos
- [ ] Tags are created in database
- [ ] Notifications sent to tagged users (if claimed)

---

## 📋 Test 4.2: Tagging - Approve Tag

### Step 1: Sign In as Tagged User
- Sign in as a user who was tagged in Test 4.1

### Step 2: Go to Review Page
1. Navigate to `/lineage/review`
2. Click **"Pending Tags"** tab
3. You should see the tag

### Step 3: Approve Tag
1. Click **"Approve"** on the tag
2. Verify:
   - ✅ Tag removed from pending list
   - ✅ Status changes to "APPROVED" in database

### ✅ Test 4.2 Success Criteria
- [ ] Tagged user sees pending tag
- [ ] Can approve tag
- [ ] Tag status updates correctly

---

## 📋 Test 5.1: Admin Management - Assign Admin

### Step 1: Open Profile Settings
1. Sign in as a profile owner
2. Open your profile (or a profile you own)
3. Go to **"Edit"** tab
4. Look for **"Admin Management"** section

### Step 2: Assign Admin
1. Click **"Add Admin"** or similar
2. A dialog should open showing family members
3. Select a family member (must be claimed)
4. Set permissions:
   - ✅ Can Edit Profile
   - ✅ Can Manage Admins (optional)
5. Click **"Add"** or **"Save"**

### Step 3: Verify Admin Assignment
1. Check database:
   - `ProfileAdmin` table
   - Find the admin assignment
   - Verify:
     - ✅ `profileId` matches the profile
     - ✅ `adminUserId` matches the selected user
     - ✅ `canEditProfile: true`
     - ✅ `assignedBy` is your userId

### Step 4: Test Admin Permissions
1. Sign in as the admin user
2. Open the profile
3. Try to edit
4. Verify: ✅ Can edit (admin permissions work)

### ✅ Test 5.1 Success Criteria
- [ ] Can assign admin
- [ ] Admin assignment saved in database
- [ ] Admin can edit profile
- [ ] Admin badge appears in profile dialog

---

## 📋 Test 5.2: Admin Management - Remove Admin

### Step 1: Remove Admin
1. Sign in as profile owner
2. Open profile → Edit → Admin Management
3. Find the admin you assigned
4. Click **"Remove"** or trash icon
5. Confirm removal

### Step 2: Verify Removal
1. Check database:
   - ✅ Admin record deleted from `ProfileAdmin` table
2. Sign in as the removed admin
3. Try to edit the profile
4. Verify: ✅ Cannot edit (permissions revoked)

### ✅ Test 5.2 Success Criteria
- [ ] Can remove admin
- [ ] Admin record deleted
- [ ] Permissions revoked correctly

---

## 📋 Test 6.1: User Preferences - Tagging Settings

### Step 1: Navigate to Preferences
1. Sign in
2. Go to `/lineage/settings/preferences`
3. OR find Settings → Preferences in navigation

### Step 2: Toggle Tagging Permission
1. Find **"Allow Tagging Without Permission"** toggle
2. Toggle it ON
3. Save preferences

### Step 3: Verify Setting Saved
1. Check database:
   - `UserPreference` table
   - Find your user's preferences
   - Verify:
     - ✅ `allowTaggingWithoutPermission: true`

### Step 4: Test Tagging
1. Have someone tag you in a photo
2. Verify:
   - ✅ Tag is automatically approved (if setting is ON)
   - ✅ OR tag still requires approval (if setting is OFF)

### ✅ Test 6.1 Success Criteria
- [ ] Preferences page loads
- [ ] Can toggle settings
- [ ] Settings save correctly
- [ ] Settings affect tagging behavior

---

## 🎉 Final Checklist

After completing all tests, verify:

### Database Integrity
- [ ] All tables have correct relationships
- [ ] Foreign keys are properly set
- [ ] No orphaned records

### UI/UX
- [ ] All badges display correctly
- [ ] Permission states are clear
- [ ] Error messages are helpful
- [ ] Notifications work properly

### Functionality
- [ ] Profile claiming works
- [ ] Content approvals work
- [ ] Tagging works
- [ ] Admin management works
- [ ] Preferences work

---

## 🐛 Common Issues & Solutions

### Issue: "Pending Claim" badge not showing
- **Check**: `isClaimed` field in database
- **Fix**: Ensure profile was created with a relationship type

### Issue: Cannot edit profile
- **Check**: Are you the owner, admin, or creator?
- **Fix**: Verify permissions in database

### Issue: Notifications not appearing
- **Check**: `Notification` table for records
- **Fix**: Verify notification creation logic

### Issue: Approval not working
- **Check**: `ContentApproval` table
- **Fix**: Verify approval status updates

---

## 📝 Notes

- Keep browser DevTools open during testing
- Check database frequently to verify data
- Test with multiple user accounts
- Test both claimed and unclaimed profiles
- Test edge cases (e.g., tagging unclaimed profiles)

---

## 🚀 Next Steps

After completing all tests:
1. Document any bugs found
2. Test edge cases
3. Test with real family data
4. Get feedback from users
5. Iterate on improvements

