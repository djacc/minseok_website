const fs = require('fs');
const path = require('path');

// Configuration
const WEB_IMAGES_DIR = 'web_images';
const GALLERY_DATA_FILE = 'gallery-data.js';

// Supported image formats
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Function to extract title from filename (removes NN_ prefix)
function extractTitle(filename) {
  // Remove extension
  const nameWithoutExt = path.parse(filename).name;
  
  // Match pattern: digits followed by underscore, then the rest is the title
  const match = nameWithoutExt.match(/^\d+_(.+)$/);
  if (match) {
    return match[1]; // Return everything after "NN_"
  }
  
  // Fallback: if no pattern match, return filename without extension
  return nameWithoutExt;
}

// Function to scan web_images directory
function scanWebImages() {
  const galleryData = [];
  
  try {
    // Read web_images directory
    const subfolders = fs.readdirSync(WEB_IMAGES_DIR)
      .filter(item => {
        const itemPath = path.join(WEB_IMAGES_DIR, item);
        return fs.statSync(itemPath).isDirectory();
      });
    
    // Sort subfolders by number prefix
    const sortedSubfolders = subfolders.sort((a, b) => {
      // Extract number from folder name (e.g., "1_asuzüge" -> 1)
      const numA = parseInt(a.match(/^(\d+)_/)?.[1]) || 999;
      const numB = parseInt(b.match(/^(\d+)_/)?.[1]) || 999;
      return numA - numB;
    });
    
    sortedSubfolders.forEach(subfolder => {
      const subfolderPath = path.join(WEB_IMAGES_DIR, subfolder);
      
      // Read images in subfolder
      // Use readdirSync with withFileTypes to get exact filenames with case preserved
      const allFiles = fs.readdirSync(subfolderPath, { withFileTypes: true });
      const imageFiles = allFiles
        .filter(dirent => {
          if (!dirent.isFile()) return false;
          const ext = path.extname(dirent.name).toLowerCase();
          return IMAGE_EXTENSIONS.includes(ext);
        })
        .map(dirent => dirent.name); // Get exact filename with preserved case
      
      // Store images with their paths and titles
      const images = imageFiles.map(file => {
        const imagePath = path.join(WEB_IMAGES_DIR, subfolder, file);
        const title = extractTitle(file);
        
        return {
          path: imagePath.replace(/\\/g, '/'), // Ensure forward slashes for web
          title: title
        };
      });
      
      galleryData.push({
        subfolder: subfolder,
        images: images
      });
    });
    
    return galleryData;
    
  } catch (error) {
    console.error('Error scanning web_images:', error);
    return [];
  }
}

// Function to generate gallery-data.js file
function generateGalleryData() {
  console.log('🔍 Scanning web_images folder...');
  
  const galleryData = scanWebImages();
  
  if (galleryData.length === 0) {
    console.log('❌ No images found in web_images folder');
    return;
  }
  
  // Generate JavaScript content
  let jsContent = '// Auto-generated gallery data\n';
  jsContent += 'window.galleryData = [\n';
  
  galleryData.forEach((subfolderData, subfolderIndex) => {
    jsContent += '  {\n';
    jsContent += `    subfolder: "${subfolderData.subfolder}",\n`;
    jsContent += '    images: [\n';
    
    subfolderData.images.forEach((image, imageIndex) => {
      jsContent += '      {\n';
      jsContent += `        path: "${image.path}",\n`;
      jsContent += `        title: "${image.title.replace(/"/g, '\\"')}"\n`; // Escape quotes in title
      jsContent += '      }';
      
      if (imageIndex < subfolderData.images.length - 1) {
        jsContent += ',';
      }
      jsContent += '\n';
    });
    
    jsContent += '    ]\n';
    jsContent += '  }';
    
    if (subfolderIndex < galleryData.length - 1) {
      jsContent += ',';
    }
    jsContent += '\n';
  });
  
  jsContent += '];\n';
  
  // Write to file
  fs.writeFileSync(GALLERY_DATA_FILE, jsContent);
  
  console.log('✅ Gallery data generated successfully!');
  console.log(`📁 Found ${galleryData.length} subfolders`);
  
  let totalImages = 0;
  galleryData.forEach(subfolderData => {
    console.log(`  - ${subfolderData.subfolder}: ${subfolderData.images.length} images`);
    totalImages += subfolderData.images.length;
  });
  
  console.log(`🖼️  Total images: ${totalImages}`);
  console.log(`📄 Gallery data saved to: ${GALLERY_DATA_FILE}`);
}

// Run the build process
if (require.main === module) {
  generateGalleryData();
}

module.exports = { scanWebImages, generateGalleryData };

