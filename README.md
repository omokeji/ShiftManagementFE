# MaxiCare Admin Booking System

A comprehensive shift management system for MaxiCare with role-based access control for both administrators and employees.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin/Employee)
- Secure login/logout functionality
- Session management with localStorage

### 👨‍💼 Admin Features
- **Dashboard**: Overview of users, shifts, and system statistics
- **User Management**: View, create, edit, and delete users
- **Shift Management**: Create and manage shifts for employees
- **Role & Access Control**: Manage user permissions and roles

### 👷‍♂️ Employee Features
- **Dashboard**: Personal statistics and shift overview
- **Calendar View**: Visual representation of shifts and available shifts
- **My Shifts**: View assigned shifts with clock in/out functionality
- **Available Shifts**: Browse and pick up available shifts
- **Time Tracking**: Clock in/out with location tracking support

### 📅 Calendar Integration
- Full calendar view with FullCalendar.js
- Color-coded shifts by status
- Interactive shift management
- Real-time updates

## Project Structure

```
MaxiCareAdminBooking/
├── assets/
│   ├── css/           # Stylesheets and UI components
│   ├── js/
│   │   ├── api.js     # Backend API communication layer
│   │   ├── auth.js    # Authentication and user management
│   │   └── lib/       # Third-party libraries
│   └── images/        # UI assets and icons
├── maxicare-backend-master/  # NestJS backend API
├── *.html            # Frontend pages
└── README.md
```

## Backend Integration

The frontend integrates with the MaxiCare NestJS backend through a comprehensive API layer:

### API Endpoints Used
- **Authentication**: `/api/auth/signin`, `/api/auth/logout`
- **Users**: `/api/users` (CRUD operations)
- **Shifts**: `/api/shifts` (shift management, clock in/out, pickup/drop)

### Key Backend Features
- JWT authentication with role-based guards
- Shift management with time tracking
- User management with role assignment
- Real-time shift status updates

## Getting Started

### Prerequisites
- Node.js and npm (for backend)
- Modern web browser
- MaxiCare backend running on `http://localhost:3000`

### Backend Setup
1. Navigate to `maxicare-backend-master/`
2. Install dependencies: `npm install`
3. Configure database connection in environment variables
4. Run migrations: `npm run migration:run`
5. Start the server: `npm run start:dev`

### Frontend Setup
1. Ensure backend is running on `http://localhost:3000`
2. Open any HTML file in a web browser
3. Start with `sign-in.html` to authenticate

## Usage

### For Administrators
1. **Login** with admin credentials
2. **Dashboard** shows system overview and statistics
3. **Users** section allows user management
4. **Calendar** provides shift overview and creation
5. **Role & Access** manages permissions

### For Employees
1. **Login** with employee credentials
2. **Dashboard** shows personal shift statistics
3. **Calendar** displays assigned and available shifts
4. **My Shifts** manages assigned shifts with clock in/out
5. **Available Shifts** allows picking up new shifts

## Key Components

### API Service (`assets/js/api.js`)
- Centralized API communication
- JWT token management
- Error handling and response processing
- Support for all backend endpoints

### Authentication Service (`assets/js/auth.js`)
- User session management
- Role-based UI control
- Automatic redirects based on permissions
- Token storage and validation

### Role-Based Navigation
- Dynamic menu items based on user role
- Admin-only features hidden from employees
- Employee-specific features for shift management

## Security Features

- JWT token-based authentication
- Role-based access control
- Secure API communication
- Session management
- Input validation and sanitization

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development Notes

### API Configuration
Update the `baseURL` in `assets/js/api.js` if your backend runs on a different port or domain.

### Role Management
User roles are determined by the backend and stored in the JWT token. The frontend respects these roles for UI rendering and feature access.

### Error Handling
Comprehensive error handling is implemented throughout the application with user-friendly error messages and fallback states.

## Future Enhancements

- Real-time notifications
- Advanced reporting and analytics
- Mobile app integration
- Enhanced time tracking with GPS
- Shift swapping between employees
- Automated shift scheduling

## Support

For technical support or feature requests, please contact the development team.

---

**MaxiCare Admin Booking System** - Streamlining shift management for healthcare professionals.
