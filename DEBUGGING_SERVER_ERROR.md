# Debugging Internal Server Error

## Quick Steps to Find the Error

### 1. Check Browser Console
1. Open your browser (Chrome/Firefox/Safari)
2. Press `F12` or right-click → "Inspect"
3. Go to the **Console** tab
4. Look for red error messages
5. Copy the error message

### 2. Check Terminal/Server Logs
1. Look at the terminal where you ran `npm run dev`
2. Scroll up to see any error messages
3. Look for lines that say "Error:" or have stack traces
4. Copy the error message

### 3. Check Network Tab
1. In browser DevTools, go to **Network** tab
2. Refresh the page or trigger the action that causes the error
3. Find the failed request (it will be red)
4. Click on it
5. Go to the **Response** or **Preview** tab
6. Look for error details

---

## Common Issues & Fixes

### Issue: "Cannot read property X of undefined"
**Likely Cause**: Missing data in request body
**Fix**: Check that all required fields are being sent

### Issue: "Prisma error" or "Database error"
**Likely Cause**: Database schema mismatch or constraint violation
**Fix**: Run `npx prisma db push` to sync schema

### Issue: "TypeError" or "ReferenceError"
**Likely Cause**: Code syntax error or missing import
**Fix**: Check the file mentioned in the error

---

## What to Share

When reporting the error, please share:
1. **The exact error message** (from console or terminal)
2. **What action triggered it** (e.g., "Creating a family member", "Loading the page")
3. **The URL** where the error occurred
4. **Any stack trace** (the lines showing file paths and line numbers)

---

## Quick Fixes to Try

1. **Restart the dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check database connection**:
   ```bash
   npx prisma db push
   ```

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Most Likely Issue

Based on recent changes, the error might be:
- Missing `createdBy` or `isClaimed` fields in database operations
- Type mismatch in the `isUnclaimed` logic
- Missing try-catch error handling

Please share the error message and I can provide a specific fix!

