// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Process gallery data: randomize images within each subfolder, then flatten
let flattenedGalleryData = [];
if (window.galleryData && Array.isArray(window.galleryData)) {
  window.galleryData.forEach((subfolderData) => {
    // Randomize images within this subfolder
    const randomizedImages = shuffleArray(subfolderData.images);
    // Add all images from this subfolder to the flattened array
    flattenedGalleryData = flattenedGalleryData.concat(randomizedImages);
  });
  
  console.log('Gallery data processed:');
  console.log(`Total images: ${flattenedGalleryData.length}`);
  flattenedGalleryData.forEach((item, index) => {
    console.log(`#${index + 1}: ${item.title} (${item.path})`);
  });
}

// Window-based scale factor system
let currentIndex = 0;

// Maximum window width cap - images won't grow larger after this width
const MAX_WINDOW_WIDTH = 1920; // Adjust this value to set your desired maximum window width

// Function to calculate scale factor based on window size and device type
function calculateScaleFactor() {
  const windowWidth = Math.min(window.innerWidth, MAX_WINDOW_WIDTH); // Cap window width
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  if (isMobile) {
    // Mobile scaling: more generous minimum sizes for better readability
    return Math.max(windowWidth / 1200, 1.5); // Min 60% scale, normalize to 800px
  } else {
    // Desktop scaling: current implementation
    return Math.min(windowWidth / 1200, 1.0); // Normalize to 1200px width
  }
}

// Function to define the square region for mobile text visibility
function getSquareRegion() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const squareSize = windowWidth;
  const squareHeight = squareSize * 0.8; // 20% less height (80% of original)
  
  // Get scroll position
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Calculate the center position
  let top = (windowHeight - squareHeight) / 2;
  
  // Check if we're at the top of the page
  if (scrollTop <= 0) {
    // Extend region to top
    top = 0;
  }
  // Check if we're at the bottom of the page
  else if (scrollTop + windowHeight >= documentHeight) {
    // Extend region to bottom
    top = windowHeight - squareHeight;
  }
  
  // Ensure the region doesn't go above the viewport
  top = Math.max(0, top);
  
  // Ensure the region doesn't go below the viewport
  top = Math.min(top, windowHeight - squareHeight);
  
  return {
    left: 0,
    top: top,
    right: windowWidth,
    bottom: top + squareHeight,
    width: windowWidth,
    height: squareHeight
  };
}

// Function to check if an element intersects with the square region
function isInSquareRegion(element) {
  const region = getSquareRegion();
  const rect = element.getBoundingClientRect();
  
  return !(rect.right < region.left || 
           rect.left > region.right || 
           rect.bottom < region.top || 
           rect.top > region.bottom);
}

// Global variable to track square visibility
let squareVisible = false;

// Function to create or update the square region visual indicator
function updateSquareRegionIndicator() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  // Remove existing indicator
  const existingIndicator = document.getElementById('square-region-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  if (!isMobile || !squareVisible) {
    return; // Don't show indicator on desktop or when hidden
  }
  
  // Create new indicator
  const region = getSquareRegion();
  const indicator = document.createElement('div');
  indicator.id = 'square-region-indicator';
  indicator.style.position = 'fixed';
  indicator.style.left = region.left + 'px';
  indicator.style.top = region.top + 'px';
  indicator.style.width = region.width + 'px';
  indicator.style.height = region.height + 'px';
  indicator.style.border = '2px solid red';
  indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  indicator.style.pointerEvents = 'none';
  indicator.style.zIndex = '1000';
  indicator.style.boxSizing = 'border-box';
  
  document.body.appendChild(indicator);
}


// Function to update text visibility based on square region
function updateTextVisibility() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  if (!isMobile) {
    // On desktop, hide all text by default (hover will show it)
    const captions = document.querySelectorAll('figcaption');
    captions.forEach(caption => {
      caption.style.visibility = 'hidden';
    });
    return;
  }
  
  // Get scroll position for edge case detection
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const documentHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const isAtTop = scrollTop <= 0;
  const isAtBottom = scrollTop + windowHeight >= documentHeight;
  
  // On mobile, check if images are in square region or edge cases
  const figures = document.querySelectorAll('figure');
  figures.forEach(figure => {
    const caption = figure.querySelector('figcaption');
    if (caption) {
      let shouldShow = false;
      
      // Check if in square region
      if (isInSquareRegion(figure)) {
        shouldShow = true;
      }
      // Check edge cases
      else if (isAtTop || isAtBottom) {
        const rect = figure.getBoundingClientRect();
        const region = getSquareRegion();
        
        if (isAtTop && rect.bottom <= region.top) {
          // Show text above square when at top
          shouldShow = true;
        } else if (isAtBottom && rect.top >= region.bottom) {
          // Show text below square when at bottom
          shouldShow = true;
        }
      }
      
      caption.style.visibility = shouldShow ? 'visible' : 'hidden';
    }
  });
}

// Function to setup hover events for desktop
function setupDesktopHoverEvents() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  if (isMobile) {
    return; // Don't setup hover events on mobile
  }
  
  const figures = document.querySelectorAll('figure');
  figures.forEach(figure => {
    const caption = figure.querySelector('figcaption');
    if (caption) {
      // Remove existing event listeners to avoid duplicates
      figure.removeEventListener('mouseenter', figure.showCaption);
      figure.removeEventListener('mouseleave', figure.hideCaption);
      
      // Create hover functions
      figure.showCaption = function() {
        caption.style.visibility = 'visible';
      };
      
      figure.hideCaption = function() {
        caption.style.visibility = 'hidden';
      };
      
      // Add hover event listeners
      figure.addEventListener('mouseenter', figure.showCaption);
      figure.addEventListener('mouseleave', figure.hideCaption);
    }
  });
}

// Function to update all existing images with new scale
function updateAllImageSizes() {
  const figures = document.querySelectorAll('figure');
  const scale = calculateScaleFactor();
  
  figures.forEach((figure, index) => {
    // Get the stored base width from data attribute
    const storedBaseWidth = parseFloat(figure.getAttribute('data-base-width'));
    
    // Apply scale factor to the stored base width
    const scaledWidth = storedBaseWidth * scale;
    figure.style.maxWidth = `${scaledWidth}%`;
  });
  
  // Update text visibility after scaling
  updateTextVisibility();
  
  // Update square region indicator
  updateSquareRegionIndicator();
  
  // Setup hover events for desktop
  setupDesktopHoverEvents();
}


// Update text visibility on scroll (for mobile)
window.addEventListener('scroll', function() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  if (isMobile) {
    updateTextVisibility();
    updateSquareRegionIndicator(); // Update square position on scroll
  }
});

// Periodic update for text visibility (fallback for mobile)
setInterval(function() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
  if (isMobile) {
    updateTextVisibility();
    updateSquareRegionIndicator(); // Update square position periodically
  }
}, 100); // Check every 100ms

// Function to set main width to window width (capped at MAX_WINDOW_WIDTH)
function setMainWidth() {
  const main = document.querySelector('main');
  if (main) {
    const cappedWidth = Math.min(window.innerWidth, MAX_WINDOW_WIDTH);
    main.style.width = `${cappedWidth}px`;
  }
}

// Set main width on page load
setMainWidth();

// Update main width on window resize
window.addEventListener('resize', function() {
  setMainWidth();
  updateAllImageSizes();
});

// Function to create and display an image
function createImage(imageData, isFirstImage) {
  // Random width between 20% and 40% (20% smaller than original 25-50%)
  const baseWidth = Math.floor(Math.random() * 20 + 10);
  
  // Apply scale factor
  const scale = calculateScaleFactor();
  const width = baseWidth * scale;
  
  const main = document.querySelector('main');
  const figure = document.createElement('figure');
  figure.setAttribute('data-base-width', baseWidth); // Store original base width
  figure.style.maxWidth = `${width}%`;
  
  const img = document.createElement('img');
  // Use encodeURI() to properly encode Unicode characters in the path
  // This handles special characters like 'ü' in folder names correctly
  img.src = encodeURI(imageData.path);
  img.alt = imageData.title;
  
  // Add error handling for failed image loads with detailed logging
  img.onerror = function() {
    console.error(`❌ Failed to load image:`);
    console.error(`   Original path: ${imageData.path}`);
    console.error(`   Encoded path: ${encodeURI(imageData.path)}`);
    console.error(`   Title: ${imageData.title}`);
    console.error(`   Current page URL: ${window.location.href}`);
  };
  
  // Log successful loads for debugging (only first few to avoid spam)
  if (currentIndex < 3) {
    img.onload = function() {
      console.log(`✅ Loaded: ${imageData.title} from ${encodeURI(imageData.path)}`);
    };
  }
  
  // Add slide animation to the first image
  if (isFirstImage) {
    img.classList.add('slide-right');
  }
  
  const figcaption = document.createElement('figcaption');
  figcaption.innerHTML = `<p>${imageData.title}</p>`;
  
  figure.appendChild(img);
  figure.appendChild(figcaption);
  
  if (isFirstImage) {
    main.appendChild(figure);
  } else {
    main.insertBefore(figure, main.firstChild);
  }
  
  return { figure, img, figcaption };
}

// Create first image on page load
if (flattenedGalleryData.length > 0) {
  const imageData = flattenedGalleryData[currentIndex];
  console.log(imageData);
  
  createImage(imageData, true);
  currentIndex++;
  
  // Update text visibility for mobile
  updateTextVisibility();
  
  // Update square region indicator
  updateSquareRegionIndicator();
  
  // Setup hover events for desktop
  setupDesktopHoverEvents();
}

document.addEventListener('click', function(event) {
  if (currentIndex < flattenedGalleryData.length) {
    const imageData = flattenedGalleryData[currentIndex];
    console.log(imageData);
    
    // Capture current positions of existing images
    const existingFigures = document.querySelectorAll('figure');
    const oldPositions = [];
    existingFigures.forEach(fig => {
      const rect = fig.getBoundingClientRect();
      oldPositions.push({
        element: fig,
        x: rect.left,
        y: rect.top
      });
    });
    
    // Create image using shared function
    const { figure, img, figcaption } = createImage(imageData, false);
    
    // Start with new image and caption invisible for animation
    img.style.opacity = '0';
    figcaption.style.opacity = '0';
    
    // Prevent image dragging
    img.addEventListener('dragstart', function(event) {
      event.preventDefault();
    });
    
      // After layout is calculated, animate existing images to new positions
      setTimeout(() => {
        existingFigures.forEach((fig, index) => {
          const newRect = fig.getBoundingClientRect();
          const oldPos = oldPositions[index];
          
          if (oldPos) {
            const deltaX = oldPos.x - newRect.left;
            const deltaY = oldPos.y - newRect.top;
            
            // Set initial position (start from old position)
            fig.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // Force reflow
            fig.offsetHeight;
            
            // Animate to final position
            fig.style.transition = 'transform .2s ease-out';
            fig.style.transform = 'translate(0px, 0px)';
            
            // Clean up after animation
            setTimeout(() => {
              fig.style.transition = '';
              fig.style.transform = '';
              
              // Update text visibility after each image finishes moving
              updateTextVisibility();
            }, 200);
          }
        });
        
        // Show new image and caption after existing images finish moving
        setTimeout(() => {
          img.style.opacity = '1';
          figcaption.style.opacity = '1';
          
        // Update text visibility for mobile after animation
        updateTextVisibility();
        
        // Update square region indicator
        updateSquareRegionIndicator();
        
        // Setup hover events for desktop
        setupDesktopHoverEvents();
        }, 200);
      }, 10);
    
    currentIndex++;
  } else {
    console.log('end reached');
  }
});

