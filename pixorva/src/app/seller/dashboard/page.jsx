// This file is at app/seller/dashboard/page.jsx

"use client";

import { useAuth } from '../../../lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerDashboard() {
  const { user, isSeller, isVerified, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to load
    }

    // 1. If not logged in, go to login
    if (!user) {
      router.push('/login');
      return;
    }

    // 2. If logged in, but NOT a seller, go to homepage
    if (!isSeller) {
      router.push('/');
      return;
    }

    // 3. If logged in AND a seller, but NOT verified, go to verification page
    if (isSeller && !isVerified) {
      router.push('/seller/verify');
      return;
    }

    // 4. If all checks pass, they can stay here.
    
  }, [user, isSeller, isVerified, loading, router]);

  // Show a loading state while checks are running
  if (loading || !user || !isSeller || (isSeller && !isVerified)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading and verifying your account...</p>
      </div>
    );
  }

  // --- This is the REAL Dashboard Content ---
  // This content will only be seen by logged-in, verified sellers.
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome to your Seller Dashboard
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        You are verified and ready to sell!
      </p>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for Dashboard widgets */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Your Listings</h2>
          <p className="mt-2 text-gray-500">Manage your product listings.</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md">
            View Listings
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Your Orders</h2>
          <p className="mt-2 text-gray-500">View and manage incoming orders.</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md">
            View Orders
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Your Payouts</h2>
          <p className="mt-2 text-gray-500">Manage your account and payouts.</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md">
            View Payouts
          </button>
        </div>
      </div>
    </div>
  );
}
