/**
 * MaxiCare Admin Booking - Router Utility
 * Handles page routing and 404 redirects
 */

class MaxiCareRouter {
  constructor() {
    this.validPages = [
      'index.html',
      'employee-dashboard.html',
      'view-profile.html',
      'my-shifts.html',
      'available-shifts.html',
      'sign-in.html',
      'sign-up.html',
      'forgot-password.html',
      'error.html',
      'access-denied.html',
      'coming-soon.html',
      'blank-page.html',
      'veiw-details.html',
      'calendar.html',
      'calendar-main.html',
      // Admin pages
      'users-list.html',
      'add-user.html',
      'role-access.html',
      'assign-role.html',
      'job-types.html',
      'add-job-type.html',
      'edit-job-type.html',
      'add-shift.html',
      'view-shifts.html',
      'clock-change-requests.html',
      'email-confirmation.html',
      'reset-password.html',
      'privacy-policy.html',
      'terms-condition.html',
      'test-connection.html',
      'test-pages.html',
      'test-role-access.html',
      // Add more valid pages as needed
    ];
    
    this.init();
  }

  init() {
    // Check if current page is valid
    this.checkCurrentPage();
    
    // Set up global error handling for navigation
    this.setupGlobalErrorHandling();
  }

  checkCurrentPage() {
    const currentPage = this.getCurrentPageName();
    
    // Skip check for error page to prevent infinite redirects
    if (currentPage === 'error.html') {
      return;
    }
    
    // Skip check for authentication pages
    const authPages = ['sign-in.html', 'sign-up.html', 'forgot-password.html'];
    if (authPages.includes(currentPage)) {
      return;
    }
    
    // Check if current page is valid
    if (!this.isValidPage(currentPage)) {
      console.warn(`Invalid page accessed: ${currentPage}. Redirecting to error page.`);
      this.redirectToError();
    }
  }

  getCurrentPageName() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    return pageName || 'index.html';
  }

  isValidPage(pageName) {
    return this.validPages.includes(pageName);
  }

  redirectToError() {
    // Store the attempted URL for reference
    sessionStorage.setItem('attemptedUrl', window.location.href);
    
    // Redirect to error page
    window.location.href = 'error.html';
  }

  setupGlobalErrorHandling() {
    // Handle navigation errors
    window.addEventListener('beforeunload', (event) => {
      // This can be used to track navigation attempts
    });

    // Handle hash changes (for SPA-like behavior if needed)
    window.addEventListener('hashchange', (event) => {
      this.handleHashChange(event);
    });

    // Handle popstate (back/forward button)
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });
  }

  handleHashChange(event) {
    const hash = event.newURL.split('#')[1];
    if (hash && !this.isValidHash(hash)) {
      console.warn(`Invalid hash accessed: ${hash}`);
      this.redirectToError();
    }
  }

  handlePopState(event) {
    const currentPage = this.getCurrentPageName();
    if (!this.isValidPage(currentPage)) {
      console.warn(`Invalid page accessed via browser navigation: ${currentPage}`);
      this.redirectToError();
    }
  }

  isValidHash(hash) {
    // Define valid hash routes if using hash-based routing
    const validHashes = [
      'dashboard',
      'profile',
      'shifts',
      'available-shifts',
      'settings'
    ];
    return validHashes.includes(hash);
  }

  // Method to programmatically navigate to a page
  navigateTo(pageName, params = {}) {
    if (!this.isValidPage(pageName)) {
      console.error(`Cannot navigate to invalid page: ${pageName}`);
      this.redirectToError();
      return;
    }

    // Build URL with parameters
    let url = pageName;
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    window.location.href = url;
  }

  // Method to get the attempted URL from error page
  getAttemptedUrl() {
    return sessionStorage.getItem('attemptedUrl') || 'Unknown';
  }

  // Method to clear attempted URL
  clearAttemptedUrl() {
    sessionStorage.removeItem('attemptedUrl');
  }

  // Method to add a new valid page dynamically
  addValidPage(pageName) {
    if (!this.validPages.includes(pageName)) {
      this.validPages.push(pageName);
    }
  }

  // Method to remove a valid page
  removeValidPage(pageName) {
    const index = this.validPages.indexOf(pageName);
    if (index > -1) {
      this.validPages.splice(index, 1);
    }
  }
}

// Create global router instance
window.maxicareRouter = new MaxiCareRouter();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaxiCareRouter;
}
