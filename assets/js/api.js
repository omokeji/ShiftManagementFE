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
                // Handle session expiration (401 Unauthorized)
                if (response.status === 401) {
                    // Clear authentication data
                    localStorage.removeItem('maxicare_user');
                    localStorage.removeItem('maxicare_token');
                    localStorage.removeItem('maxicare_remember_me');
                    sessionStorage.removeItem('maxicare_user');
                    
                    // Redirect to login page
                    window.location.href = 'sign-in.html';
                    return;
                }
                
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
        const userData = localStorage.getItem('maxicare_user') || sessionStorage.getItem('maxicare_user');
        
        if (!userData) {
            throw new Error('User not authenticated. Please login again.');
        }
        
        const currentUser = JSON.parse(userData);
        const userRole = currentUser.role;
        
        // console.log('API Role check:', { requiredRole, userRole, currentUser });
        
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
        return await this.request('/shifts/user');
    }

    async getUserShifts() {
        try {
            this.checkRoleAccess('user');
            return await this.request('/shifts/user');
        } catch (error) {
            console.warn('Role check failed for user shifts, trying without role check:', error);
            // Try without role check if role check fails
            return await this.request('/shifts/user');
        }
    }

    async getAvailableShifts() {
        try {
            this.checkRoleAccess('user');
            return await this.request('/shifts/available');
        } catch (error) {
            console.warn('Role check failed for available shifts, trying without role check:', error);
            // Try without role check if role check fails
            return await this.request('/shifts/available');
        }
    }

    async pickUpShift(shiftId) {
        this.checkRoleAccess('user');
        return await this.request(`/shifts/pickup/${shiftId}`, {
            method: 'POST',
        });
    }

    async dropShift(shiftId) {
        this.checkRoleAccess('user');
        return await this.request(`/shifts/drop/${shiftId}`, {
            method: 'POST',
        });
    }

    async clockIn(shiftId, lat, lon) {
        this.checkRoleAccess('user');
        return await this.request('/clockin-records/clock-in', {
            method: 'POST',
            body: JSON.stringify({ shiftId, lat, lon }),
        });
    }

    async clockOut(shiftId, note) {
        this.checkRoleAccess('user');
        return await this.request('/clockin-records/clock-out', {
            method: 'POST',
            body: JSON.stringify({ shiftId, note }),
        });
    }

    async requestClockInChange(shiftId, requestedClockIn) {
        this.checkRoleAccess('user');
        return await this.request('/clockin-records/request-clockin-change', {
            method: 'POST',
            body: JSON.stringify({ shiftId, requestedClockIn }),
        });
    }

    // Notification methods
    async getNotifications(page = 1, limit = 10, filters = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });
        return await this.request(`/notifications?${queryParams}`);
    }

    async getUnreadNotificationCount() {
        return await this.request('/notifications/unread-count');
    }

    async markNotificationAsRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, {
            method: 'PATCH'
        });
    }

    async markAllNotificationsAsRead() {
        return await this.request('/notifications/mark-all-read', {
            method: 'PATCH'
        });
    }

    async deleteNotification(notificationId) {
        return await this.request(`/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    }

    // Clock-in records methods
    async getClockInRecords(page = 1, limit = 10, filters = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });
        return await this.request(`/clockin-records?${queryParams}`);
    }

    async getActiveClockInRecords() {
        return await this.request('/clockin-records/active');
    }

    async getPendingClockInChangeRequests() {
        return await this.request('/clockin-records/pending-requests');
    }

    async getUserClockInRecords(userId, page = 1, limit = 10) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        return await this.request(`/clockin-records/user/${userId}?${queryParams}`);
    }

    async getShiftClockInRecords(shiftId, page = 1, limit = 10) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        return await this.request(`/clockin-records/shift/${shiftId}?${queryParams}`);
    }

    async getTotalHoursWorked(userId, startDate, endDate) {
        const queryParams = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        return await this.request(`/clockin-records/user/${userId}/total-hours?${queryParams}`);
    }

    async getTotalEarnings(userId, startDate, endDate) {
        const queryParams = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        return await this.request(`/clockin-records/user/${userId}/total-earnings?${queryParams}`);
    }

    async approveClockInChange(shiftId, userId, approve) {
        this.checkRoleAccess('admin');
        return await this.request('/clockin-records/approve-clockin-change', {
            method: 'POST',
            body: JSON.stringify({ shiftId, userId, approve }),
        });
    }

    async getRecentTimeEntries() {
        this.checkRoleAccess('user');
        // Get user's recent clock-in records instead of time entries
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            return await this.getUserClockInRecords(currentUser.id, 1, 10);
        }
        throw new Error('User not found');
    }

    async generateShiftReport(filters = {}) {
        this.checkRoleAccess('admin');
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.jobId) queryParams.append('jobId', filters.jobId);
        if (filters.format) queryParams.append('format', filters.format);
        
        const queryString = queryParams.toString();
        const url = `/shifts/reports${queryString ? '?' + queryString : ''}`;
        return await this.request(url);
    }

    async getTodayTimeSummary() {
        this.checkRoleAccess('user');
        return await this.request('/shifts/time-summary');
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
        return await this.request('/analytics/dashboard-stats');
    }

    async getShiftAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/shift-analytics?period=${period}`);
    }

    async getUserAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/user-analytics?period=${period}`);
    }

    async getRevenueAnalytics(period = '30d') {
        this.checkRoleAccess('admin');
        return await this.request(`/analytics/revenue-analytics?period=${period}`);
    }

    async getPerformanceMetrics() {
        this.checkRoleAccess('admin');
        return await this.request('/analytics/performance-metrics');
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
