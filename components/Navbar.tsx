'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Taxigo
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : session ? (
              <>
                <Link
                  href={session.user.role === 'driver' ? '/driver' : '/dashboard'}
                  className="px-4 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Dashboard
                </Link>
                <Link
                  href="/book"
                  className="px-4 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Book Trip
                </Link>
                <Link
                  href="/analytics"
                  className="px-4 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Analytics
                </Link>
                <div className="flex items-center gap-3 px-4 py-2 glass rounded-lg">
                  <span className="text-white text-sm font-medium">{session.user.name}</span>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg text-sm font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-red-500/50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
