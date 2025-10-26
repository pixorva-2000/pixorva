// This file goes at components/Navbar.jsx

"use client"; // This must be a client component because it's interactive

import Link from 'next/link';
import { useAuth } from '../lib/context/AuthContext'; // Import the hook
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  // 1. Get the user data and seller status from the context
  const { user, isSeller } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // AuthProvider will automatically handle the redirect/state change
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Home Link */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Pixorva
            </Link>
          </div>

          {/* Links & Auth Buttons */}
          <div className="flex items-center space-x-6">
            {user ? (
              // --- User is LOGGED IN ---
              <>
                {isSeller ? (
                  // User is a seller
                  <Link href="/seller/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Seller Dashboard
                  </Link>
                ) : (
                  // User is NOT a seller
                  <Link href="/start-selling" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Start Selling
                  </Link>
                )}
                
                {/* Secondary (Outlined) Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              // --- User is LOGGED OUT ---
              <>
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                
                {/* Primary (Solid) Sign Up Button */}
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm hover:bg-gray-700 transition-colors"
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

