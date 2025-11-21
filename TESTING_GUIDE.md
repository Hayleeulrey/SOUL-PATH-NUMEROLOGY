# Testing Guide - Permission & Content Approval System

## Pre-Testing Setup

Before starting testing, ensure:

1. **Build passes**: Run `npm run build` and fix any TypeScript errors
2. **Database is synced**: Run `npx prisma db push` to ensure schema is up to date
3. **Dependencies installed**: Run `npm install`
4. **Test users created**: Have at least 2-3 test user accounts ready

## Quick Start Testing

### Critical Path Tests (Do These First)

1. **Profile Creation & Claiming**
   - Create a family member profile
   - Send invitation
   - Claim profile via token
   - Verify profile is marked as claimed

2. **Permission Checks**
   - Try editing unclaimed profile as non-creator → should fail
   - Try editing claimed profile as non-owner → should fail
   - Edit own profile → should work

3. **Content Approval**
   - Add photo to someone else's claimed profile
   - Verify approval record created
   - As owner, approve the content
   - Verify content is now visible

4. **Tagging**
   - Tag someone in a photo
   - Verify notification sent
   - As tagged user, approve tag
   - Verify tag is visible

## Testing Checklist

See `TESTING_CHECKLIST.md` for the complete detailed checklist covering all 15 test categories.

## Common Issues to Watch For

1. **Permission Errors**: If you see 403 errors, check:
   - Is the profile claimed?
   - Is the user the owner or admin?
   - Are permission checks working in API endpoints?

2. **Missing Notifications**: If notifications don't appear:
   - Check browser console for errors
   - Verify notification API is working
   - Check that notifications are being created in database

3. **Badge Counts**: If badge counts are wrong:
   - Refresh the page
   - Check that pending counts are being fetched correctly
   - Verify database queries are correct

## Manual Testing Tips

1. **Use Browser DevTools**: 
   - Check Network tab for API calls
   - Check Console for errors
   - Use React DevTools to inspect component state

2. **Database Inspection**:
   - Use `npx prisma studio` to inspect database directly
   - Check that records are being created correctly
   - Verify relationships between tables

3. **Multiple Browsers/Users**:
   - Test with different user accounts simultaneously
   - Use incognito mode for second user
   - Test permission boundaries between users

## Reporting Issues

When you find a bug, document:
- What you were trying to do
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser/OS information
- Any error messages or console logs

## Next Steps After Testing

Once testing is complete:
1. Fix any critical bugs found
2. Update documentation based on findings
3. Consider adding automated tests for critical paths
4. Review and improve error messages based on user feedback

