# Taxigo - Advanced Features Setup Guide

This guide will help you set up the advanced features that have been added to Taxigo.

## 1. Real-time GPS Tracking with Maps

### Setup
- Maps are already integrated using Leaflet (OpenStreetMap)
- For production, you can switch to Google Maps by updating the `MapView` component
- Real-time tracking requires a Socket.io server (optional)

### Socket.io Server (Optional)
If you want real-time tracking, set up a Socket.io server:

```javascript
// server.js
const io = require('socket.io')(3001, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  socket.on('join-trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('driver-location-update', (data) => {
    io.to(data.tripId).emit('driver-location-update', data.location);
  });
});
```

Add to `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 2. Payment Gateway Integration

### Razorpay Setup
1. Sign up at https://razorpay.com
2. Get your Key ID and Key Secret from the dashboard
3. Add to `.env.local`:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Stripe Setup
1. Sign up at https://stripe.com
2. Get your secret key from the dashboard
3. Add to `.env.local`:
```
STRIPE_SECRET_KEY=your_secret_key
```

### Add Razorpay SDK to Frontend
Add this script to `app/layout.tsx`:
```tsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

## 3. Push Notifications

### Generate VAPID Keys
Run this command:
```bash
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

Add to `.env.local`:
```
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

Also add to `.env.local` (for client-side):
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
```

### Service Worker
The service worker is already created at `public/sw.js`. Make sure it's accessible.

### Subscribe Users
Users need to grant notification permission. Add this to your dashboard:
```tsx
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/notifications';

// In your component
const handleSubscribe = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    await subscribeToPushNotifications();
  }
};
```

## 4. Rating and Review System

### Already Implemented
- Rating API at `/api/ratings`
- Rating form component
- Driver ratings page at `/driver/ratings`

### Usage
After a trip is completed, users can rate the trip from the trip details page.

## 5. Route Optimization

### Google Maps API Setup
1. Get API key from https://console.cloud.google.com
2. Enable "Directions API" and "Maps JavaScript API"
3. Add to `.env.local`:
```
GOOGLE_MAPS_API_KEY=your_api_key
```

### Without Google Maps
The system will fall back to simple distance calculation if the API key is not provided.

## Testing the Features

1. **Maps**: Visit the booking page and enter addresses - you'll see the map update
2. **Payments**: Create a trip and try to make payment (use Razorpay test mode)
3. **Notifications**: Grant permission and test sending notifications
4. **Ratings**: Complete a trip and submit a rating
5. **Route Optimization**: Book a trip with origin and destination to see optimized route

## Troubleshooting

### Maps not showing
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Check if addresses are being geocoded correctly

### Payments not working
- Verify API keys are correct
- Check Razorpay/Stripe dashboard for errors
- Ensure payment gateway is in test mode for testing

### Notifications not working
- Check browser supports notifications
- Verify VAPID keys are set correctly
- Check service worker is registered
- Look for errors in browser console

### Route optimization not working
- Verify Google Maps API key is valid
- Check API quotas in Google Cloud Console
- System will fall back to simple calculation if API fails

