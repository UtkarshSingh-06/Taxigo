'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center animate-fade-in">
          <div className="mb-8 animate-slide-in-up">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Taxigo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner for long-distance cab bookings. Book one-way,
              two-way trips, or grab a mid-way ride when drivers are returning
              empty.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/book"
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl text-lg font-bold text-white overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>🚗</span> Book a Trip
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/register"
              className="group px-10 py-5 glass rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <span>✨</span> Sign Up
              </span>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div
            className="glass rounded-2xl p-8 card-hover border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent animate-slide-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="text-6xl mb-6 animate-float">🚗</div>
            <h3 className="text-2xl font-bold text-white mb-4">One-Way Trips</h3>
            <p className="text-gray-300 leading-relaxed">
              Book a comfortable ride from your origin to destination with our
              reliable drivers. Fast, safe, and affordable.
            </p>
          </div>

          <div
            className="glass rounded-2xl p-8 card-hover border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent animate-slide-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '1s' }}>
              🔄
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Two-Way Trips</h3>
            <p className="text-gray-300 leading-relaxed">
              Plan your round trip with scheduled return journey at your
              convenience. Book once, travel twice.
            </p>
          </div>

          <div
            className="glass rounded-2xl p-8 card-hover border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-transparent animate-slide-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '2s' }}>
              📍
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Mid-Way Booking</h3>
            <p className="text-gray-300 leading-relaxed">
              Book a ride from anywhere along a driver&apos;s return route and
              save money. Smart travel, smart savings.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div
            className="glass rounded-2xl p-8 card-hover border-2 border-green-500/30 animate-slide-in-up"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">💳</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Payments</h3>
                <p className="text-gray-300">
                  Multiple payment options with secure gateways. Your transactions are safe and encrypted.
                </p>
              </div>
            </div>
          </div>

          <div
            className="glass rounded-2xl p-8 card-hover border-2 border-yellow-500/30 animate-slide-in-up"
            style={{ animationDelay: '700ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">⭐</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Rated Drivers</h3>
                <p className="text-gray-300">
                  All our drivers are verified and rated. Travel with confidence and peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
