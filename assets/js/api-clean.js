// API Service Layer for MaxiCare Backend
class MaxiCareAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // Update this to match your backend URL
        this.token = localStorage.getItem('maxicare_token');
        this.useMockData = false; // Disabled - using real backend endpoints
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('maxicare_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('maxicare_token');
    }

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = data.message || data || `HTTP ${response.status}: ${response.statusText}`;
                const error = new Error(errorMessage);
                error.status = response.status;
                error.response = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle different types of errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to the server. Please check your internet connection and ensure the backend is running on http://localhost:3000');
            }
            
            if (error.message.includes('CORS')) {
                throw new Error('CORS error: Please ensure the backend server is running and CORS is properly configured.');
            }
            
            if (error.message.includes('404')) {
                throw new Error('API endpoint not found. Please check if the backend is running and the endpoint exists.');
            }
            
            if (error.message.includes('500')) {
                throw new Error('Server error. Please try again later or contact support.');
            }
            
            throw error;
        }
    }

    // Role-based access control
    checkRoleAccess(requiredRole) {
        const currentUser = JSON.parse(localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user') || '{}');
        const userRole = currentUser.role;
        
        // Admin has access to everything
        if (userRole === 'admin' || userRole === 'administrator') {
            return true;
        }
        
        // Check specific role requirements
        if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'administrator') {
            throw new Error('Access denied. Admin privileges required.');
        }
        
        if (requiredRole === 'user' && userRole !== 'user' && userRole !== 'employee') {
            throw new Error('Access denied. User privileges required.');
        }
        
        return true;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('maxicare_token');
        const user = localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user');
        return !!(token && user);
    }

    // Authentication API methods
    async signIn(email, password) {
        const response = await this.request('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('API signIn response:', response);
        
        // Handle the backend response format - check for both 'success' and 'status'
        if ((response.success || response.status) && response.data && response.data.access_token) {
            this.setToken(response.data.access_token);
            return {
                success: true,
                data: {
                    access_token: response.data.access_token,
                    username: response.data.username,
                    role: response.data.role,
                    user: response.data.user
                },
                message: response.message
            };
        }
        
        return response;
    }

    async signUp(userData) {
        try {
            console.log('SignUp Data:', userData);
            const response = await this.request('/auth/user/signup', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            console.log('SignUp Response:', response);
            // Handle the backend response format - check for both 'success' and 'status'
            if ((response.success || response.status) && response.data && response.data.access_token) {
                this.setToken(response.data.access_token);
            }
            
            return response;
        } catch (error) {
            console.error('SignUp Error Details:', {
                message: error.message,
                status: error.status,
                response: error.response,
                stack: error.stack
            });
            
            // Handle validation errors from backend
            if (error.message && (error.message.includes('validation') || error.message.includes('must be'))) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    async signOut() {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    async changePassword(oldPassword, newPassword) {
        const response = await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        return response;
    }

    async requestPasswordReset(email) {
        const response = await this.request('/auth/request-password-reset', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return response;
    }

    async resetPassword(token, newPassword) {
        const response = await this.request(`/auth/reset-password?token=${token}&newPassword=${encodeURIComponent(newPassword)}`, {
            method: 'POST',
        });
        return response;
    }

    async resendConfirmation(email) {
        const response = await this.request('/auth/resend-confirmation', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return response;
    }

    // User API methods
    async getUsers() {
        this.checkRoleAccess('admin');
        return await this.request('/users');
    }

    async getUser(id) {
        const response = await this.request(`/users/${id}`);
        return response;
    }

    async createUser(userData) {
        this.checkRoleAccess('admin');
        return await this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id, userData) {
        this.checkRoleAccess('admin');
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id) {
        this.checkRoleAccess('admin');
        return await this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    // Shift API methods
    async getShifts() {
        this.checkRoleAccess('user');
        return await this.request('/shifts');
    }

    async getShift(id) {
        this.checkRoleAccess('user');
        return await this.request(`/shifts/${id}`);
    }

    async createShift(shiftData) {
        this.checkRoleAccess('admin');
        return await this.request('/shifts', {
            method: 'POST',
            body: JSON.stringify(shiftData),
        });
    }

    async updateShift(id, shiftData) {
        this.checkRoleAccess('admin');
        return await this.request(`/shifts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(shiftData),
        });
    }

    async deleteShift(id) {
        this.checkRoleAccess('admin');
        return await this.request(`/shifts/${id}`, {
            method: 'DELETE',
        });
    }

    async getMyShifts() {
        this.checkRoleAccess('user');
        return await this.request('/shifts/my-shifts');
    }

    async getAvailableShifts() {
        this.checkRoleAccess('user');
        return await this.request('/shifts/available');
    }

    async pickUpShift(shiftId) {
        this.checkRoleAccess('user');
        return await this.request('/shifts/pickup', {
            method: 'POST',
            body: JSON.stringify({ shiftId }),
        });
    }

    async dropShift(shiftId) {
        this.checkRoleAccess('user');
        return await this.request('/shifts/drop', {
            method: 'POST',
            body: JSON.stringify({ shiftId }),
        });
    }

    async clockIn(shiftId, lat, lon) {
        this.checkRoleAccess('user');
        return await this.request('/shifts/clock-in', {
            method: 'POST',
            body: JSON.stringify({ shiftId, lat, lon }),
        });
    }

    async clockOut(shiftId, note) {
        this.checkRoleAccess('user');
        return await this.request('/shifts/clock-out', {
            method: 'POST',
            body: JSON.stringify({ shiftId, note }),
        });
    }

    // Job Types API methods
    async getJobTypes() {
        this.checkRoleAccess('user');
        return await this.request('/job-types');
    }

    async getJobType(id) {
        this.checkRoleAccess('user');
        return await this.request(`/job-types/${id}`);
    }

    async createJobType(jobTypeData) {
        this.checkRoleAccess('admin');
        return await this.request('/job-types', {
            method: 'POST',
            body: JSON.stringify(jobTypeData),
        });
    }

    async updateJobType(id, jobTypeData) {
        this.checkRoleAccess('admin');
        return await this.request(`/job-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobTypeData),
        });
    }

    async deleteJobType(id) {
        this.checkRoleAccess('admin');
        return await this.request(`/job-types/${id}`, {
            method: 'DELETE',
        });
    }

    // Analytics API methods
    async getDashboardStats() {
        this.checkRoleAccess('admin');
        return await this.request('/analytics/dashboard');
    }

    async getShiftAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/shifts?period=${period}`);
    }

    async getUserAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/users?period=${period}`);
    }

    async getRevenueAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/revenue?period=${period}`);
    }

    async getPerformanceMetrics() {
        this.checkRoleAccess('admin');
        return await this.request('/analytics/performance');
    }

    async getRecentActivities(limit = 10) {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/recent-activities?limit=${limit}`);
    }
}

// Create global API instance
window.maxicareAPI = new MaxiCareAPI();

// Log successful initialization
console.log('MaxiCare API initialized successfully');
