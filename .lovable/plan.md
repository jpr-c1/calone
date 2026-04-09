

## Plan: Replace Google Doc Creation with Copy-to-Clipboard

### What changes
Remove the Google Doc creation logic from `AddContentDialog.tsx` and instead, after content is created, copy a formatted prompt to the clipboard.

### Clipboard text format
```
I'm writing <title> for <channel>. Here's a short description to help you get started: "<description>"
```

### Changes to `src/components/AddContentDialog.tsx`

1. **Remove Google Doc logic** (lines 86-147): Delete the entire block that fetches the session, retrieves the refresh token, calls the `create-google-doc` edge function, and handles `docUrl`.

2. **Add clipboard copy** after building `newContent`: Use `navigator.clipboard.writeText()` with the formatted string, show a toast confirming it was copied.

3. **Remove `doc_url` from `newContent`** (line 155): No longer needed since we're not creating a Google Doc.

4. **Remove unused imports**: `supabase` import (line 15) if no longer used elsewhere in the file (it's still used for `handleAddNewCampaign`—so keep it).

### Resulting `handleSubmit` flow
```
1. Validate fields
2. Call onAddContent with { title, description, channel, owner_id, publish_date, campaign_id }
3. Copy formatted text to clipboard
4. Show toast "Copied to clipboard!"
5. Reset form & close dialog
```

### Files modified
- `src/components/AddContentDialog.tsx` — main changes

