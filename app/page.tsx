'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Zoom Glass ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-violet-500/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[80px]" />
        {/* Subtle grid overlay - Spline-style depth */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Hero - Central Glass Lens (Zoom Glass focal point) */}
        <div className="glass-lens rounded-3xl p-12 lg:p-16 mb-20 animate-fade-in">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                Taxigo
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Your trusted partner for long-distance cab bookings. Book one-way,
              two-way trips, or grab a mid-way ride when drivers are returning
              empty.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <Link
                href="/book"
                className="group relative px-10 py-4 rounded-2xl text-base font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 40px rgba(56, 189, 248, 0.15)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2 text-white">
                  <span>🚗</span> Book a Trip
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/register"
                className="glass-panel px-10 py-4 rounded-2xl text-base font-semibold text-white border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="flex items-center gap-2">
                  <span>✨</span> Sign Up
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features - Glass panels in grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div
            className="glass-panel rounded-2xl p-8 card-hover border border-white/10 animate-slide-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="text-5xl mb-6 opacity-90">🚗</div>
            <h3 className="text-xl font-bold text-white mb-3">One-Way Trips</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Book a comfortable ride from your origin to destination with our
              reliable drivers. Fast, safe, and affordable.
            </p>
          </div>

          <div
            className="glass-panel rounded-2xl p-8 card-hover border border-white/10 animate-slide-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="text-5xl mb-6 opacity-90">🔄</div>
            <h3 className="text-xl font-bold text-white mb-3">Two-Way Trips</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Plan your round trip with scheduled return journey at your
              convenience. Book once, travel twice.
            </p>
          </div>

          <div
            className="glass-panel rounded-2xl p-8 card-hover border border-white/10 animate-slide-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="text-5xl mb-6 opacity-90">📍</div>
            <h3 className="text-xl font-bold text-white mb-3">Mid-Way Booking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Book a ride from anywhere along a driver&apos;s return route and
              save money. Smart travel, smart savings.
            </p>
          </div>
        </div>

        {/* Secondary features - horizontal glass strips */}
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="glass-panel rounded-2xl p-8 card-hover border border-white/10 flex items-center gap-6 animate-slide-in-up"
            style={{ animationDelay: '600ms' }}
          >
            <div className="text-4xl">💳</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Secure Payments</h3>
              <p className="text-slate-400 text-sm">
                Multiple payment options with secure gateways. Your transactions are safe and encrypted.
              </p>
            </div>
          </div>

          <div
            className="glass-panel rounded-2xl p-8 card-hover border border-white/10 flex items-center gap-6 animate-slide-in-up"
            style={{ animationDelay: '700ms' }}
          >
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Rated Drivers</h3>
              <p className="text-slate-400 text-sm">
                All our drivers are verified and rated. Travel with confidence and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
