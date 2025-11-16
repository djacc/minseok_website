# How to Add New Images to the Gallery

This guide explains how to add new subfolders and images to the website gallery.

## Adding a New Subfolder with Images

### Step 1: Create the Subfolder

1. Navigate to the `web_images` folder in your project
2. Create a new subfolder with the following naming convention:
   ```
   NUMBER_name
   ```
   Where `NUMBER` determines the display order (lower numbers appear first) and `name` is a descriptive name.

   **Example:** `6_portfolio` or `3_exhibition`

### Step 2: Add Images to the Subfolder

1. Place your image files in the subfolder you just created
2. Name your images using this format:
   ```
   NN_title.extension
   ```
   Where:
   - `NN` = Two-digit number (01, 02, 03, etc.) - used for internal ordering
   - `title` = The display title for the image (what appears under the image)
   - `extension` = Image file extension (.jpg, .png, .jpeg, etc.)

   **Example filenames:**
   - `01_main_work.jpg` → Display title: "main work"
   - `02_detail_view.png` → Display title: "detail view"
   - `03_process_sketch.jpeg` → Display title: "process sketch"

### Step 3: Regenerate the Gallery Data

After adding your images, you need to regenerate the `gallery-data.js` file:

1. Open a terminal in the project root directory
2. Run the build script:
   ```bash
   node scripts/build-gallery.js
   ```

   You should see output like:
   ```
   🔍 Scanning web_images folder...
   ✅ Gallery data generated successfully!
   📁 Found X subfolders
     - subfolder_name: Y images
   🖼️  Total images: Z
   📄 Gallery data saved to: gallery-data.js
   ```

### Step 4: Test the Website

1. Open `index.html` in your browser
2. Click through the gallery to verify your new images appear in the correct order
3. Check that image titles display correctly (without the `NN_` prefix)

## Important Notes

### Supported Image Formats

The following image formats are supported:
- `.jpg`
- `.jpeg`
- `.png`
- `.gif`
- `.webp`

### Folder Ordering

- Folders are sorted by the **number prefix** at the beginning of the folder name
- Lower numbers appear first
- If you want to change the order, simply rename the folders with different numbers
- After renaming, run `node scripts/build-gallery.js` to update

### Image Ordering Within Folders

- Images within each subfolder are displayed in **random order** each time the page loads
- The numbering in filenames (`01_`, `02_`, etc.) is ignored for display order
- All images from one subfolder are shown before moving to the next subfolder

### Image Title Display

- The title displayed under each image is extracted from the filename
- The `NN_` prefix is automatically removed
- Only the text after the number and underscore is shown

**Example:**
- Filename: `01_my_artwork.jpg`
- Display title: `my artwork`

### Reordering Existing Content

If you want to change the order of existing subfolders:

1. Rename the folders with different number prefixes
2. Run `node scripts/build-gallery.js`
3. The new order will be reflected in the gallery

## Troubleshooting

### Images not appearing?
- Make sure you've run `node scripts/build-gallery.js` after adding files
- Check that image filenames follow the `NN_title.extension` format
- Verify the images are in the correct subfolder under `web_images`

### Wrong order?
- Check the number prefix on your folder name
- Lower numbers appear first
- Run the build script again after making changes

### Title not displaying correctly?
- Ensure your filename follows the `NN_title` format
- The title text should come after a number and underscore (e.g., `01_my title.jpg`)

