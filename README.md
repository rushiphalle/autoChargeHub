# AutoChargeHub 2.0

A comprehensive EV charging station finder and booking system with two user roles: EV owners and charging station owners.

## Features

### For EV Owners
- **Home Page**: General static page with information about the platform
- **Profile Management**: Minimal profile with basic info and logout
- **My Bookings**: View all bookings with detailed information
- **Services**: Two main services
  - **Nearby Charging Station Finder**: Interactive map with live location, real-time availability, and instant booking
  - **All Charging Stations Map**: Browse all stations nationwide with advanced filtering

### For Charging Station Owners
- **Home Page**: General static page
- **Dashboard**: Statistics overview (total stations, bookings, revenue, etc.)
- **My Profile**: Complete profile management with bank details
- **My Stations**: Add, edit, and manage charging stations with slot blocking capabilities
- **My Bookings**: Detailed view of all bookings with status management

## Technology Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Leaflet for interactive maps
- Stripe for payment processing
- Axios for API calls
- CSS-in-JS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- Nodemailer for email services
- Express Validator for input validation

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Stripe account for payments

### Environment Variables

Create a `.env` file in the root directory with the following variables


Create a `.env` file in the `client` directory


### Installation

1. **Install server dependencies:**
   ```bash
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers:**

   **Option 1: Start both servers separately**
   ```bash
   # Terminal 1 - Start backend server
   npm run dev

   # Terminal 2 - Start frontend server
   npm run client
   ```

   **Option 2: Use the provided scripts**
   ```bash
   # Start backend only
   npm start

   # Start frontend only
   npm run client
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
ev-charging-hub/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   │   ├── ev-owner/   # EV owner pages
│   │   │   └── station-owner/ # Station owner pages
│   │   └── App.tsx
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   ├── ChargingStation.js
│   └── Booking.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── stations.js
│   ├── bookings.js
│   └── payments.js
├── middleware/             # Custom middleware
│   └── auth.js
├── server.js              # Main server file
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Charging Stations
- `GET /api/stations` - Get all stations (with optional location filter)
- `GET /api/stations/:id` - Get single station
- `POST /api/stations` - Create new station (station owners only)
- `PUT /api/stations/:id` - Update station (station owners only)
- `DELETE /api/stations/:id` - Delete station (station owners only)
- `GET /api/stations/owner/my-stations` - Get owner's stations
- `POST /api/stations/:id/block-slots` - Block slots for maintenance
- `GET /api/stations/:id/stats` - Get station statistics

### Bookings
- `POST /api/bookings` - Create new booking (EV owners only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/station/:stationId` - Get station's bookings (station owners only)
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/review` - Add rating and review
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/availability/:stationId` - Get available slots

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/status/:bookingId` - Get payment status
- `POST /api/payments/refund` - Process refund (station owners only)
- `GET /api/payments/station/:stationId/history` - Get payment history

## Key Features Implemented

### User Authentication & Authorization
- JWT-based authentication
- Role-based access control (EV owner vs Station owner)
- Protected routes and API endpoints

### Charging Station Management
- CRUD operations for stations
- Geospatial queries for nearby stations
- Slot management and blocking
- Real-time availability tracking

### Booking System
- Advanced booking with time slot selection
- Vehicle information capture
- Special requests handling
- Booking status management
- Cancellation policies

### Payment Integration
- Stripe payment processing
- Payment intent creation and confirmation
- Refund processing
- Payment status tracking

### Interactive Maps
- Leaflet integration for station visualization
- Live location detection
- Custom location search
- Real-time station filtering

### User Experience
- Responsive design for all devices
- Intuitive navigation based on user role
- Real-time updates and notifications
- Comprehensive error handling

## Database Schema

### User Model
- Personal information (name, email, phone, address)
- Role (station_owner or ev_owner)
- Bank details (for station owners)
- Authentication fields

### ChargingStation Model
- Station information (name, description, address)
- Location (geospatial coordinates)
- Capacity (total and available slots)
- Pricing and operating hours
- Amenities and blocked slots

### Booking Model
- User and station references
- Time slot and duration
- Payment information
- Vehicle details
- Status tracking and reviews

## Development Notes

- All API responses follow consistent error handling patterns
- Input validation using express-validator
- Geospatial indexing for efficient location queries
- Comprehensive error logging and debugging
- Mobile-responsive design throughout

## Deployment

The application is ready for deployment on platforms like Heroku, Vercel, or any cloud provider. Make sure to:

1. Set up production environment variables
2. Configure MongoDB Atlas for production
3. Update Stripe keys for production
4. Set up proper CORS configuration
5. Configure email service for production

## Support

For any issues or questions, please check the console logs and ensure all environment variables are properly configured.

