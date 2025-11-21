# Testing Checklist - Permission & Content Approval System

## Test Environment Setup
- [ ] Database is up to date with latest migrations
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Test user accounts created (at least 2-3 users)

---

## 1. Profile Claiming & Invitation Flow

### 1.1 Create Unclaimed Profile
- [ ] Create a new family member profile
- [ ] Verify `isClaimed` is `false` by default
- [ ] Verify `createdBy` field is set to creator's userId
- [ ] Verify profile shows "Pending Claim" badge

### 1.2 Send Invitation
- [ ] Send invitation with valid email
- [ ] Verify invitation is created in database
- [ ] Verify invitation token is generated
- [ ] Verify invitation status is "PENDING"
- [ ] Verify invitation email is sent (check logs/console)

### 1.3 Claim Profile via Token
- [ ] Access `/claim/[token]` with valid token
- [ ] Verify profile preview displays correctly
- [ ] Verify claim button is enabled
- [ ] Click "Claim This Profile"
- [ ] Verify `isClaimed` is set to `true`
- [ ] Verify `claimedAt` timestamp is set
- [ ] Verify redirect to `/lineage/review` page
- [ ] Verify notification is created for existing content

### 1.4 Claim Profile via Onboarding
- [ ] Sign up with email that has pending invitation
- [ ] Verify invitation step shows pending invitation
- [ ] Click "Claim My Profile"
- [ ] Verify profile is claimed
- [ ] Verify redirect to review page

### 1.5 Invalid/Expired Invitations
- [ ] Try to access claim page with invalid token → should show error
- [ ] Try to access claim page with expired token → should show expiration message
- [ ] Try to claim already-claimed profile → should show appropriate message

---

## 2. Permission System

### 2.1 Unclaimed Profile Permissions
- [ ] As original creator: Can edit unclaimed profile → should work
- [ ] As different user: Try to edit unclaimed profile → should be blocked (403)
- [ ] As different user: Try to delete unclaimed profile → should be blocked (403)
- [ ] Verify tooltip shows correct message when edit is disabled

### 2.2 Claimed Profile Permissions
- [ ] As profile owner: Can edit own profile → should work
- [ ] As different user: Try to edit claimed profile → should be blocked (403)
- [ ] As different user: Try to delete claimed profile → should be blocked (403)
- [ ] Verify permission checks work in API endpoints

### 2.3 Admin Permissions
- [ ] Profile owner assigns admin to another user
- [ ] Verify admin can edit profile
- [ ] Verify admin badge appears for admin user
- [ ] Verify non-admin cannot edit
- [ ] Remove admin → verify they can no longer edit

---

## 3. Content Approval System

### 3.1 Create Content Requiring Approval
- [ ] As non-owner: Add photo to claimed profile
- [ ] Verify `ContentApproval` record is created with status `PENDING`
- [ ] Verify `createdBy` is set correctly
- [ ] Verify notification is sent to profile owner
- [ ] Verify photo is not visible until approved (or show with pending badge)

### 3.2 Approve Content
- [ ] As profile owner: Go to review page
- [ ] See pending approval in list
- [ ] Click "Approve"
- [ ] Verify approval status changes to `APPROVED`
- [ ] Verify `reviewedAt` and `reviewedBy` are set
- [ ] Verify content is now visible/accessible
- [ ] Verify notification is marked as read

### 3.3 Deny Content
- [ ] As profile owner: See pending approval
- [ ] Click "Deny"
- [ ] Verify approval status changes to `DENIED`
- [ ] Verify content is hidden/removed (or marked as denied)
- [ ] Verify notification is marked as read

### 3.4 Content Types Requiring Approval
Test each content type:
- [ ] Photos
- [ ] Documents
- [ ] Audio files
- [ ] Relationships (both profiles)
- [ ] Biography responses

---

## 4. Content Tagging System

### 4.1 Tag People in Content
- [ ] Open photo/story in profile dialog
- [ ] Click "Tag People" button
- [ ] Verify tag dialog opens
- [ ] Select multiple family members
- [ ] Click "Tag"
- [ ] Verify `ContentTag` records are created with status `PENDING`
- [ ] Verify notifications are sent to tagged users
- [ ] Verify email notifications are sent (if enabled)

### 4.2 Approve Tags
- [ ] As tagged user: Go to review page
- [ ] See pending tag in "Pending Tags" tab
- [ ] Click "Approve"
- [ ] Verify tag status changes to `APPROVED`
- [ ] Verify tag is now visible

### 4.3 Deny Tags
- [ ] As tagged user: See pending tag
- [ ] Click "Deny"
- [ ] Verify tag status changes to `DENIED`
- [ ] Verify tag is removed

### 4.4 Multiple Tags on Same Content
- [ ] Tag multiple people in same photo
- [ ] Verify each person gets separate tag record
- [ ] Verify each person gets notification
- [ ] Verify all can approve/deny independently

### 4.5 Tag Unclaimed Profiles
- [ ] Tag someone who hasn't claimed their profile
- [ ] Verify tag is created
- [ ] Verify notification is sent if email exists
- [ ] Verify reminder to add email if no email exists
- [ ] When profile is claimed, verify tag notification is shown

---

## 5. Notification System

### 5.1 Notification Creation
- [ ] Create content requiring approval → verify notification created
- [ ] Tag someone → verify notification created
- [ ] Claim profile → verify notification created for existing content

### 5.2 Notification Display
- [ ] Verify notification bell shows unread count
- [ ] Click bell → verify dropdown shows recent notifications
- [ ] Verify notifications show correct icons and messages
- [ ] Verify unread notifications have visual indicator

### 5.3 Notification Actions
- [ ] Click notification → verify it's marked as read
- [ ] Verify unread count decreases
- [ ] Click "View All & Review" → verify redirect to review page
- [ ] Verify notification navigation works correctly

### 5.4 Email Notifications
- [ ] Enable email notifications in preferences
- [ ] Trigger notification event
- [ ] Verify email is sent (check logs/console)
- [ ] Disable email notifications
- [ ] Trigger notification event
- [ ] Verify email is NOT sent

---

## 6. Review Page

### 6.1 Pending Approvals Tab
- [ ] Navigate to `/lineage/review`
- [ ] Verify "Pending Approvals" tab shows all pending content
- [ ] Verify each approval shows:
  - Content type and preview
  - Creator information
  - Created date
  - Approve/Deny buttons
- [ ] Click "Approve" → verify approval works
- [ ] Click "Deny" → verify denial works

### 6.2 Pending Tags Tab
- [ ] Switch to "Pending Tags" tab
- [ ] Verify all pending tags are listed
- [ ] Verify each tag shows:
  - Content type and preview
  - Who tagged you
  - Tagged date
  - Approve/Deny buttons
- [ ] Click "Approve" → verify tag approval works
- [ ] Click "Deny" → verify tag denial works

### 6.3 Empty States
- [ ] View review page with no pending items
- [ ] Verify appropriate empty state message
- [ ] Verify tabs are still accessible

---

## 7. User Preferences

### 7.1 Tagging Preferences
- [ ] Navigate to `/lineage/settings/preferences`
- [ ] Toggle "Allow others to tag me without permission"
- [ ] Save preferences
- [ ] Verify setting is persisted
- [ ] Test tagging behavior with setting on/off

### 7.2 Email Notification Preferences
- [ ] Toggle "Email notifications"
- [ ] Save preferences
- [ ] Verify setting is persisted
- [ ] Test email sending with setting on/off

---

## 8. Admin Management

### 8.1 Assign Admin
- [ ] As profile owner: Go to edit tab
- [ ] Scroll to "Profile Admins" section
- [ ] Click "Add Admin"
- [ ] Select family member from dropdown
- [ ] Set permissions (can edit, can manage admins)
- [ ] Click "Add Admin"
- [ ] Verify admin is added to list
- [ ] Verify admin can now edit profile

### 8.2 Remove Admin
- [ ] As profile owner: View admin list
- [ ] Click remove button on admin
- [ ] Confirm removal
- [ ] Verify admin is removed
- [ ] Verify admin can no longer edit profile

### 8.3 Admin Permissions
- [ ] Admin with "can edit" only → verify can edit profile
- [ ] Admin with "can edit" only → verify CANNOT manage admins
- [ ] Admin with "can manage admins" → verify can add/remove admins
- [ ] Non-admin user → verify cannot see admin section

---

## 9. Profile Status Badges

### 9.1 Badge Display
- [ ] Unclaimed profile → shows "Pending Claim" badge
- [ ] Profile with pending approvals → shows "Pending Review (N)" badge
- [ ] Profile with pending tags → shows "Tagged (N)" badge
- [ ] Admin user viewing profile → shows "Admin" badge
- [ ] Verify badge counts are accurate

### 9.2 Badge Updates
- [ ] Add content requiring approval → verify badge count updates
- [ ] Approve content → verify badge count decreases
- [ ] Tag someone → verify badge count updates
- [ ] Approve tag → verify badge count decreases

---

## 10. API Endpoint Tests

### 10.1 Content Approval API
- [ ] `GET /api/content-approvals` → returns pending approvals
- [ ] `POST /api/content-approvals/approve` → approves content
- [ ] `POST /api/content-approvals/deny` → denies content
- [ ] Verify unauthorized users cannot approve/deny

### 10.2 Content Tags API
- [ ] `POST /api/content-tags` → creates tags
- [ ] `GET /api/content-tags?taggedMemberId=X&status=PENDING` → filters correctly
- [ ] `POST /api/content-tags/[id]/approve` → approves tag
- [ ] `POST /api/content-tags/[id]/deny` → denies tag
- [ ] `DELETE /api/content-tags/[id]` → removes tag

### 10.3 Profile Admins API
- [ ] `GET /api/profile-admins/[profileId]` → returns admins
- [ ] `POST /api/profile-admins` → creates admin
- [ ] `DELETE /api/profile-admins/[id]` → removes admin
- [ ] Verify permission checks work

### 10.4 Claim Profile API
- [ ] `POST /api/family-members/[id]/claim` → claims profile
- [ ] Verify creates approval records for existing content
- [ ] Verify sends notifications
- [ ] Verify unauthorized users cannot claim

### 10.5 Notifications API
- [ ] `GET /api/notifications` → returns notifications with unread count
- [ ] `PATCH /api/notifications/[id]` → marks notification as read
- [ ] Verify only returns user's own notifications

---

## 11. Edge Cases & Error Handling

### 11.1 Concurrent Operations
- [ ] Multiple users try to claim same profile → only first succeeds
- [ ] Multiple users tag same person in same content → all tags created
- [ ] Owner approves while creator tries to delete → appropriate handling

### 11.2 Missing Data
- [ ] Try to approve non-existent content → error handling
- [ ] Try to tag non-existent person → error handling
- [ ] Try to claim non-existent profile → error handling

### 11.3 Permission Edge Cases
- [ ] Original creator tries to edit after profile is claimed → blocked
- [ ] Admin tries to remove themselves → appropriate handling
- [ ] User tries to assign themselves as admin → appropriate handling

### 11.4 Data Integrity
- [ ] Delete profile → verify all related approvals/tags are cleaned up
- [ ] Delete content → verify related approvals/tags are cleaned up
- [ ] Delete user → verify related data is handled appropriately

---

## 12. UI/UX Testing

### 12.1 Visual Feedback
- [ ] Loading states show during async operations
- [ ] Success/error messages display appropriately
- [ ] Disabled buttons show tooltips explaining why
- [ ] Badge counts update in real-time

### 12.2 Navigation
- [ ] Notification bell → review page navigation works
- [ ] Review page → content detail navigation works
- [ ] Settings → preferences navigation works
- [ ] Claim flow → review page redirect works

### 12.3 Responsive Design
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Verify all dialogs/modals work on mobile

---

## 13. Performance Testing

### 13.1 Large Datasets
- [ ] Test with 100+ pending approvals
- [ ] Test with 100+ pending tags
- [ ] Test with 50+ family members
- [ ] Verify pagination/loading works correctly

### 13.2 Real-time Updates
- [ ] Notification count updates without refresh
- [ ] Badge counts update without refresh
- [ ] Review page updates when items are approved/denied

---

## 14. Security Testing

### 14.1 Authorization
- [ ] Verify all API endpoints check authentication
- [ ] Verify permission checks cannot be bypassed
- [ ] Verify users cannot access other users' notifications
- [ ] Verify users cannot approve/deny for other users

### 14.2 Data Validation
- [ ] Invalid content types are rejected
- [ ] Invalid user IDs are rejected
- [ ] Malformed requests are handled gracefully

---

## 15. Integration Testing

### 15.1 End-to-End Flows
- [ ] Complete flow: Create profile → Invite → Claim → Review → Approve
- [ ] Complete flow: Add content → Tag people → Approve tags
- [ ] Complete flow: Assign admin → Admin edits → Remove admin

### 15.2 Cross-Feature Integration
- [ ] Tagging works with all content types
- [ ] Approvals work with all content types
- [ ] Notifications work for all event types
- [ ] Admin permissions work across all features

---

## Test Results Summary

After completing all tests, document:
- [ ] Total tests run: ___
- [ ] Tests passed: ___
- [ ] Tests failed: ___
- [ ] Critical bugs found: ___
- [ ] Non-critical issues found: ___
- [ ] Performance issues: ___
- [ ] Security concerns: ___

---

## Notes
- Test with multiple user accounts to verify permission boundaries
- Test with both claimed and unclaimed profiles
- Test with various content types
- Document any bugs or issues found during testing
- Verify all error messages are user-friendly

