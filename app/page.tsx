import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Taxigo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your trusted partner for long-distance cab bookings. Book one-way,
            two-way trips, or grab a mid-way ride when drivers are returning
            empty.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/book"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
            >
              Book a Trip
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">One-Way Trips</h3>
            <p className="text-gray-600">
              Book a comfortable ride from your origin to destination with our
              reliable drivers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Two-Way Trips</h3>
            <p className="text-gray-600">
              Plan your round trip with scheduled return journey at your
              convenience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">Mid-Way Booking</h3>
            <p className="text-gray-600">
              Book a ride from anywhere along a driver&apos;s return route and
              save money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

