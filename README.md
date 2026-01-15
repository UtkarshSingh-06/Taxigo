# Taxigo - Long Distance Cab Booking Platform

A full-stack taxi booking platform similar to Uber/Ola with special features for long-distance trips.

## Features

- **User Authentication**: Secure login and registration system
- **One-Way Trips**: Book trips from origin to destination
- **Two-Way Trips**: Book round trips with return journey
- **Mid-Way Booking**: Book a ride if a driver is returning without a client
- **Real-Time Tracking**: Track drivers and trips in real-time
- **Driver Dashboard**: Manage trips and availability
- **User Dashboard**: View booking history and manage trips

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-Time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud like MongoDB Atlas)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
MONGODB_URI=your_mongodb_connection_string
# Example for local: mongodb://localhost:27017/taxigo
# For cloud databases, use your provider's connection string format

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here_min_32_characters
# You can generate a secret using: openssl rand -base64 32
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. **Register as a User**: Create an account to book trips
2. **Register as a Driver**: Create a driver account with vehicle details
3. **Book a Trip**: Use the booking page to create one-way, two-way, or mid-way trips
4. **Driver Dashboard**: Drivers can view available trips and manage their bookings

## Project Structure

```
taxigo/
├── app/
│   ├── api/          # API routes
│   ├── (auth)/       # Authentication pages
│   ├── dashboard/    # User dashboard
│   ├── driver/       # Driver dashboard
│   └── layout.tsx    # Root layout
├── components/       # React components
├── lib/             # Utilities and configurations
├── models/          # Database models
└── types/           # TypeScript types
```

## Features in Detail

### One-Way Trip
Book a trip from point A to point B.

### Two-Way Trip
Book a round trip with a return journey scheduled.

### Mid-Way Booking
If a driver is returning without a client, users can book from any point along the return route to the destination. This feature provides:
- **Cost Savings**: 30% discount on mid-way bookings
- **Efficient Resource Utilization**: Helps drivers find passengers for return trips
- **Convenience**: Book rides even when drivers are already on the road

## Usage Guide

### For Users

1. **Sign Up/Login**: Create an account or login
2. **Book a Trip**: 
   - Choose trip type (one-way, two-way, or mid-way)
   - Enter pickup and destination addresses
   - Select date and time
   - Confirm booking
3. **View Trips**: Check your dashboard for all bookings
4. **Cancel Trips**: Cancel pending trips from your dashboard

### For Drivers

1. **Register as Driver**: Sign up with vehicle and license details
2. **Go Online**: Toggle availability in driver dashboard
3. **Accept Trips**: View and accept available trip requests
4. **Manage Trips**: Start, complete, and track your trips
5. **Update Location**: Keep your location updated for mid-way bookings

## API Endpoints

- `POST /api/register` - User/Driver registration
- `GET /api/trips?type=my-trips` - Get user's trips
- `GET /api/trips?type=mid-way-opportunities` - Get mid-way booking opportunities
- `POST /api/trips` - Create a new trip
- `PATCH /api/trips/[id]` - Update trip (assign driver, update status)
- `DELETE /api/trips/[id]` - Cancel a trip
- `GET /api/drivers?type=my-profile` - Get driver profile
- `GET /api/drivers?type=my-trips` - Get driver's trips
- `PATCH /api/drivers` - Update driver availability/location

## Development

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set all required environment variables in `.env.local`:
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `STRIPE_SECRET_KEY`: Stripe secret key (optional, for payments)
- `RAZORPAY_KEY_ID`: Razorpay key ID (optional, for payments)
- `RAZORPAY_KEY_SECRET`: Razorpay key secret (optional, for payments)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (optional, for route optimization)
- `VAPID_PUBLIC_KEY`: VAPID public key (optional, for push notifications)
- `VAPID_PRIVATE_KEY`: VAPID private key (optional, for push notifications)
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server URL (optional, for real-time tracking)

## Advanced Features

### ✅ Real-time GPS Tracking with Maps Integration
- Interactive map view using Leaflet
- Real-time driver location tracking
- Route visualization
- Trip tracking component for live updates

### ✅ Payment Gateway Integration
- **Stripe** and **Razorpay** support
- Secure payment processing
- Payment verification
- Transaction history

### ✅ Push Notifications
- Web Push API integration
- Service Worker support
- Real-time trip updates
- Driver availability notifications

### ✅ Rating and Review System
- 5-star rating system
- Written reviews
- Driver rating aggregation
- Rating display on driver profiles

### ✅ Advanced Route Optimization
- Google Maps Directions API integration
- Route optimization with waypoints
- Distance and duration calculation
- Fallback route calculation

## Future Enhancements

- Multi-language support
- Advanced analytics dashboard
- Referral program
- Loyalty points system

