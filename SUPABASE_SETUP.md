# Supabase Storage Setup Guide for Study Material

## Overview

This application now uses **Supabase Storage** to store PDF, Image, and Document files for the Study Material module instead of base64 encoding. This provides better performance, scalability, and file management.

## Prerequisites

You already have:
- ✅ Supabase project configured with PostgreSQL database
- ✅ Project ID: `stiwhnfmndjhbrtwfhwk`
- ✅ Supabase URL: `https://stiwhnfmndjhbrtwfhwk.supabase.co`

## What You Need to Add

You need to get your **Supabase Service Role Key** from your Supabase project settings.

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `stiwhnfmndjhbrtwfhwk`
3. Go to **Settings → API**
4. Look for **Service Role Key** (not the Anon Key)
5. Copy the entire key

### Step 2: Update .env File

Add the following to your `.env` file:

```
# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL="https://stiwhnfmndjhbrtwfhwk.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_COPIED_KEY_HERE"
```

Replace `YOUR_COPIED_KEY_HERE` with the actual Service Role Key you copied in Step 1.

### Example:
```
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXdobmZtbmRqaGJydHdmaHdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.XXXXXXXXXXXXXXXXXXXXX"
```

## How It Works

### File Upload Flow

1. User selects PDF/Image/Document in Study Material modal
2. File is read and previewed locally
3. When user clicks "Save Material":
   - File is uploaded to Supabase Storage
   - Storage path: `{userId}/{subject}/{materialId}.{extension}`
   - Supabase returns a public URL
   - Material record is created with the Supabase URL
4. PDF/Image can be viewed/downloaded using the public URL

### File Organization in Supabase Storage

```
study-materials/ (bucket)
├── user-id-1/
│   ├── CSS/
│   │   ├── mat-123.pdf (CSS Flexbox PDF)
│   │   ├── mat-124.png (CSS Grid Image)
│   │   └── mat-125.docx (CSS Notes Document)
│   ├── Java/
│   │   ├── mat-201.pdf (Java OOP PDF)
│   │   └── mat-202.png (Java Concurrency Image)
│   └── DBMS/
│       └── mat-301.pdf (Normalization PDF)
└── user-id-2/
    └── ...
```

**Benefits:**
- ✅ Files organized by user and subject
- ✅ Automatic ID-based naming prevents conflicts
- ✅ Each file is accessible via public URL
- ✅ No large database bloat from base64
- ✅ Easy to manage and delete files

## Features Enabled

### After Setup, You Get:

✅ **Upload PDFs** - Store study PDFs in Supabase
✅ **Upload Images** - Store study images/screenshots
✅ **Upload Documents** - Store Word/Text documents
✅ **Open in Browser** - Click "PDF" button → opens in new tab
✅ **Download** - Click "Download" button → saves to computer
✅ **Subject Organization** - Files grouped by subject
✅ **Public URLs** - Files accessible via Supabase public URLs

## Example Supabase URLs

Once uploaded, files will have URLs like:

```
https://stiwhnfmndjhbrtwfhwk.supabase.co/storage/v1/object/public/study-materials/user-123/CSS/mat-123.pdf

https://stiwhnfmndjhbrtwfhwk.supabase.co/storage/v1/object/public/study-materials/user-123/Java/mat-201.png
```

## Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
- Add `NEXT_PUBLIC_SUPABASE_URL` to your `.env` file
- Value should be: `https://stiwhnfmndjhbrtwfhwk.supabase.co`

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
- Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file
- Get it from Supabase Dashboard → Settings → API → Service Role Key

### Error: "Upload failed: Unauthorized"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is correct
- The key should start with `eyJ...` (JWT token format)

### Bucket Not Created
- The application automatically creates the `study-materials` bucket on first upload
- If it fails, you can create it manually in Supabase Dashboard:
  - Storage → New Bucket
  - Name: `study-materials`
  - Make Public: ✅ Yes

## Security Notes

🔒 **Service Role Key** (in `.env`):
- This is a sensitive credential used for server-side uploads
- **NEVER** commit `.env` to version control
- Only your backend can access this key
- Users cannot use this key to modify other users' files

🔐 **Public URLs**:
- Files are stored publicly in Supabase Storage
- Anyone with the URL can view/download
- This is the intended behavior for study materials
- User isolation is maintained at the database level

## Testing

To test if everything works:

1. Go to Study Material page
2. Click "+ Add Material"
3. Fill in details:
   - Name: "Test PDF"
   - Subject: "CSS"
   - Unit: "Unit 1"
   - Type: "PDF"
4. Click to upload a PDF file
5. Click "Save Material"
6. You should see: "Uploading to Supabase..." then "File uploaded successfully!"
7. The material appears with a Supabase public URL

## Reference

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**Once you add the Supabase credentials to your `.env` file, the Study Material upload system will be fully functional!**
