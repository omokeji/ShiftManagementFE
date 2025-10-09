// Authentication and User Management Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionCheckInterval = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem('maxicare_token');
        const rememberMe = localStorage.getItem('maxicare_remember_me');
        
        // Check localStorage first (for remember me), then sessionStorage
        let userData = localStorage.getItem('maxicare_user');
        if (!userData) {
            userData = sessionStorage.getItem('maxicare_user');
        }
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                maxicareAPI.setToken(token);
                
                // Start global session monitoring
                this.startSessionMonitoring();
                
                console.log('User authenticated successfully:', this.currentUser.email);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        } else {
            console.log('No token or user data found, user not authenticated');
        }
    }


    async login(email, password, rememberMe = false) {
        try {
            console.log('Auth service login attempt for:', email);
            const response = await maxicareAPI.signIn(email, password);
            console.log('Login response:', response);
            
            // Check for both 'success' and 'status' fields
            if (response.success || response.status) {
                // Handle both direct user data and nested user object
                const userData = response.data.user || response.data;
                this.currentUser = {
                    id: userData.id,
                    username: userData.username || response.data.username,
                    email: userData.email || email,
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    phone: userData.phone,
                    team: userData.team,
                    title: userData.title,
                    role: userData.role || response.data.role || 'user',
                    isConfirmed: userData.isConfirmed,
                    profilePicture: userData.profilePicture
                };
                
                this.isAuthenticated = true;
                
                // Store the access token
                if (response.data.access_token) {
                    localStorage.setItem('maxicare_token', response.data.access_token);
                    maxicareAPI.setToken(response.data.access_token);
                    console.log('Access token stored');
                }
                
                // Store user data based on remember me preference
                if (rememberMe) {
                    // Store in localStorage for persistent login
                    localStorage.setItem('maxicare_user', JSON.stringify(this.currentUser));
                    localStorage.setItem('maxicare_remember_me', 'true');
                    console.log('User data stored in localStorage (remember me)');
                } else {
                    // Store in sessionStorage for session-only login
                    sessionStorage.setItem('maxicare_user', JSON.stringify(this.currentUser));
                    localStorage.removeItem('maxicare_user');
                    localStorage.removeItem('maxicare_remember_me');
                    console.log('User data stored in sessionStorage (session only)');
                }
                
                console.log('Login successful, returning user data');
                
                // Start global session monitoring after successful login
                this.startSessionMonitoring();
                
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async logout() {
        try {
            await maxicareAPI.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Stop session monitoring
            this.stopSessionMonitoring();
            
            // Clear all storage
            localStorage.removeItem('maxicare_user');
            localStorage.removeItem('maxicare_token');
            localStorage.removeItem('maxicare_remember_me');
            sessionStorage.removeItem('maxicare_user');
            
            maxicareAPI.clearToken();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        // Check both the flag and actual storage
        const hasToken = localStorage.getItem('maxicare_token');
        const hasUser = localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user');
        
        const isLoggedIn = this.isAuthenticated && this.currentUser !== null && hasToken && hasUser;
        
        // If we have storage but not the flags, reinitialize
        if (hasToken && hasUser && (!this.isAuthenticated || !this.currentUser)) {
            console.log('Reinitializing auth from storage...');
            this.init();
        }
        
        return isLoggedIn;
    }

    isAdmin() {
        const isAdmin = this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'administrator');
        return isAdmin;
    }

    isEmployee() {
        return this.currentUser && (this.currentUser.role === 'employee' || this.currentUser.role === 'user');
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isRememberMeEnabled() {
        return localStorage.getItem('maxicare_remember_me') === 'true';
    }

    // Redirect to login if not authenticated
    requireAuth() {
        // Check if we're already on the sign-in page to prevent redirect loops
        if (window.location.pathname.includes('sign-in.html')) {
            return false;
        }
        
        if (!this.isLoggedIn()) {
            console.log('User not authenticated, redirecting to sign-in');
            window.location.href = 'sign-in.html';
            return false;
        }
        
        return true;
    }

    // Wait for authentication to be ready
    async waitForAuth() {
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds max wait
        
        while (attempts < maxAttempts) {
            if (this.isLoggedIn()) {
                return true;
            }
            
            // Try to reinitialize if we have storage data
            const hasToken = localStorage.getItem('maxicare_token');
            const hasUser = localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user');
            
            if (hasToken && hasUser && (!this.isAuthenticated || !this.currentUser)) {
                console.log('Reinitializing auth...');
                this.init();
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // If we still have storage data, consider it authenticated
        const hasToken = localStorage.getItem('maxicare_token');
        const hasUser = localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user');
        
        if (hasToken && hasUser) {
            console.log('Auth timeout but storage exists, considering authenticated');
            return true;
        }
        
        return false;
    }

    // Redirect to appropriate dashboard based on role
    redirectToDashboard() {
        console.log('Redirecting to dashboard...');
        console.log('User logged in:', this.isLoggedIn());
        console.log('Current user:', this.currentUser);
        console.log('Is admin:', this.isAdmin());
        console.log('Is employee:', this.isEmployee());
        
        if (!this.isLoggedIn()) {
            console.log('User not logged in, redirecting to sign-in');
            window.location.href = 'sign-in.html';
            return;
        }

        // Check current page to prevent redirect loops
        const currentPage = window.location.pathname;
        console.log('Current page:', currentPage);

        if (this.isAdmin()) {
            if (!currentPage.includes('index.html')) {
                console.log('Redirecting to admin dashboard (index.html)');
                window.location.href = 'index.html';
            } else {
                console.log('Already on admin dashboard');
            }
        } else if (this.isEmployee()) {
            if (!currentPage.includes('employee-dashboard.html')) {
                console.log('Redirecting to employee dashboard (employee-dashboard.html)');
                window.location.href = 'employee-dashboard.html';
            } else {
                console.log('Already on employee dashboard');
            }
        } else {
            if (!currentPage.includes('employee-dashboard.html')) {
                console.log('Default redirect to employee dashboard');
                window.location.href = 'employee-dashboard.html';
            } else {
                console.log('Already on employee dashboard');
            }
        }
    }

    // Update user profile
    updateUserProfile(userData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...userData };
            localStorage.setItem('maxicare_user', JSON.stringify(this.currentUser));
        }
    }

    // Global session monitoring methods
    startSessionMonitoring() {
        // Clear any existing interval
        this.stopSessionMonitoring();
        
        console.log('Starting global session monitoring');
        
        // Wait a bit before starting the first check to ensure user is fully authenticated
        setTimeout(async () => {
            await this.checkSessionValidity();
        }, 2000); // 2 seconds delay
        
        // Check session validity every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            await this.checkSessionValidity();
        }, 5 * 60 * 1000); // 5 minutes

        // Also check on page visibility change (when user comes back to tab)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Check on window focus (when user switches back to the browser)
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
    }

    stopSessionMonitoring() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
            console.log('Stopped global session monitoring');
        }
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        window.removeEventListener('focus', this.handleWindowFocus.bind(this));
    }

    async checkSessionValidity() {
        if (!this.isAuthenticated || !this.currentUser) {
            console.log('Global session monitoring: User not authenticated, skipping check');
            return;
        }

        console.log('Global session monitoring: Checking session validity for user:', this.currentUser.email);

        try {
            // Make a simple API call to check if session is still valid
            // Use a lightweight endpoint that requires authentication
            const response = await maxicareAPI.getJobTypes();
            console.log('Global session monitoring: API response:', response);
            
            if (!response.status && !response.success) {
                console.log('Global session monitoring: Session expired detected, redirecting to login');
                this.handleSessionExpired();
            } else {
                console.log('Global session monitoring: Session is valid');
            }
        } catch (error) {
            console.log('Global session monitoring: API error:', error);
            if (error.status === 401) {
                console.log('Global session monitoring: Session expired (401), redirecting to login');
                this.handleSessionExpired();
            }
        }
    }

    async handleVisibilityChange() {
        if (!document.hidden && this.isAuthenticated) {
            await this.checkSessionValidity();
        }
    }

    async handleWindowFocus() {
        if (this.isAuthenticated) {
            await this.checkSessionValidity();
        }
    }

    handleSessionExpired() {
        // Clear authentication data
        this.currentUser = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('maxicare_user');
        localStorage.removeItem('maxicare_token');
        localStorage.removeItem('maxicare_remember_me');
        sessionStorage.removeItem('maxicare_user');
        
        maxicareAPI.clearToken();
        
        // Stop session monitoring
        this.stopSessionMonitoring();
        
        // Redirect to login page
        window.location.href = 'sign-in.html';
    }
}

// Create global auth service instance
window.authService = new AuthService();

// Utility functions for role-based UI
window.showForAdmin = function(element) {
    if (authService.isAdmin()) {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
};

window.showForEmployee = function(element) {
    if (authService.isEmployee()) {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
};

window.showForRole = function(element, role) {
    if (authService.hasRole(role)) {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    if (authService.isLoggedIn()) {
        // Update UI with user information
        const user = authService.getCurrentUser();
        
        // Update user name in navigation
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.username || user.email;
        });

        // Update user role in navigation
        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(element => {
            if (user.role === 'admin' || user.role === 'administrator') {
                element.textContent = 'Admin';
            } else if (user.role === 'user' || user.role === 'employee') {
                element.textContent = 'Employee';
            } else {
                element.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            }
        });

        // Show/hide elements based on role
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            showForAdmin(element);
        });

        const employeeOnlyElements = document.querySelectorAll('.employee-only');
        employeeOnlyElements.forEach(element => {
            showForEmployee(element);
        });
    } else {
        // Redirect to login if not authenticated (except on login/signup pages)
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'sign-in.html' && currentPage !== 'sign-up.html' && currentPage !== 'forgot-password.html') {
            window.location.href = 'sign-in.html';
        }
    }
});
