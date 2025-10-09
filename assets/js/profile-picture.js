/**
 * Profile Picture Management
 * Handles loading and displaying user profile pictures across the application
 */

// Load and display profile picture for the current user
function loadProfilePicture() {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  const defaultImage = 'assets/images/user.png';
  const profileImage = currentUser.profilePicture || defaultImage;

  // Update all profile images on the page
  updateAllProfileImages(profileImage);
}

// Update all profile image elements on the page
function updateAllProfileImages(imageUrl) {
  if (!imageUrl) {
    imageUrl = 'assets/images/user.png';
  }

  // Update navbar dropdown profile image
  const navbarDropdownImg = document.querySelector('.navbar-header .dropdown button img');
  if (navbarDropdownImg) {
    navbarDropdownImg.src = imageUrl;
  }

  // Update sidebar profile images (if any)
  const sidebarImages = document.querySelectorAll('.sidebar .user-profile img');
  sidebarImages.forEach(img => {
    img.src = imageUrl;
  });

  // Update profile card images
  const profileCardImages = document.querySelectorAll('.user-grid-card img.rounded-circle');
  profileCardImages.forEach(img => {
    img.src = imageUrl;
  });

  // Update any other profile images with class 'user-profile-image'
  const userProfileImages = document.querySelectorAll('.user-profile-image');
  userProfileImages.forEach(img => {
    img.src = imageUrl;
  });
}

// Refresh profile picture from API
async function refreshProfilePicture() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const response = await maxicareAPI.getUser(currentUser.id);
    if (response.status && response.data) {
      const user = response.data;
      
      // Update localStorage
      const updatedUser = { ...currentUser, profilePicture: user.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update images on page
      const profileImage = user.profilePicture || 'assets/images/user.png';
      updateAllProfileImages(profileImage);
    }
  } catch (error) {
    console.error('Error refreshing profile picture:', error);
  }
}

// Initialize profile pictures on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load profile picture from localStorage first for immediate display
  setTimeout(() => {
    loadProfilePicture();
    
    // Then refresh from API to ensure we have the latest profile picture
    // This is important for users who logged in before profilePicture was added to localStorage
    refreshProfilePicture();
  }, 100);
});

// Refresh profile picture every 5 minutes
setInterval(() => {
  refreshProfilePicture();
}, 5 * 60 * 1000);

