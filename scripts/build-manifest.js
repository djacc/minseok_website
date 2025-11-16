const fs = require('fs');
const path = require('path');

// Configuration
const PORTFOLIO_DIR = 'portfolio';
const MANIFEST_FILE = 'scripts/portfolio-manifest.json';

// Function to scan portfolio directory
function scanPortfolio() {
    const manifest = [];
    
    try {
        // Read portfolio directory
        const projectFolders = fs.readdirSync(PORTFOLIO_DIR)
            .filter(item => fs.statSync(path.join(PORTFOLIO_DIR, item)).isDirectory())
            .sort(); // Sort alphabetically first
        
        // Sort by priority (extract number from folder name)
        const sortedProjects = projectFolders.sort((a, b) => {
            const priorityA = parseInt(a.split('-')[0]) || 999;
            const priorityB = parseInt(b.split('-')[0]) || 999;
            return priorityA - priorityB;
        });
        
        sortedProjects.forEach(projectFolder => {
            const projectPath = path.join(PORTFOLIO_DIR, projectFolder);
            const projectPriority = parseInt(projectFolder.split('-')[0]) || 999;
            const projectName = projectFolder.split('-').slice(1).join('-');
            
            // Read images in project folder
            const imageFiles = fs.readdirSync(projectPath)
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.jpg', '.jpeg', '.png'].includes(ext);
                })
                .sort(); // Sort alphabetically first
            
            // Sort images by priority (extract number from filename)
            const sortedImages = imageFiles.sort((a, b) => {
                const priorityA = parseInt(a.split('-')[0]) || 999;
                const priorityB = parseInt(b.split('-')[0]) || 999;
                return priorityA - priorityB;
            });
            
            const project = {
                projectPriority,
                projectName,
                images: []
            };
            
            sortedImages.forEach(imageFile => {
                const imagePriority = parseInt(imageFile.split('-')[0]) || 999;
                const imageName = imageFile.split('-').slice(1).join('-').replace(path.extname(imageFile), '');
                const imagePath = path.join(PORTFOLIO_DIR, projectFolder, imageFile);
                
                project.images.push({
                    priority: imagePriority,
                    filename: imageFile,
                    title: imageName,
                    path: imagePath.replace(/\\/g, '/') // Ensure forward slashes for web
                });
            });
            
            manifest.push(project);
        });
        
        return manifest;
        
    } catch (error) {
        console.error('Error scanning portfolio:', error);
        return [];
    }
}

// Function to generate manifest file
function generateManifest() {
    console.log('🔍 Scanning portfolio folder...');
    
    const manifest = scanPortfolio();
    
    if (manifest.length === 0) {
        console.log('❌ No portfolio data found');
        return;
    }
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.dirname(MANIFEST_FILE);
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Write manifest file
    const manifestContent = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(MANIFEST_FILE, manifestContent);
    
    console.log('✅ Manifest generated successfully!');
    console.log(`📁 Found ${manifest.length} projects`);
    
    let totalImages = 0;
    manifest.forEach(project => {
        console.log(`  - ${project.projectName}: ${project.images.length} images`);
        totalImages += project.images.length;
    });
    
    console.log(`🖼️  Total images: ${totalImages}`);
    console.log(`📄 Manifest saved to: ${MANIFEST_FILE}`);
}

// Run the build process
if (require.main === module) {
    generateManifest();
}

module.exports = { scanPortfolio, generateManifest };

