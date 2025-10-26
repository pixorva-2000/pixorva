// This file is at app/login/page.jsx

"use client"; // This must be a client component for the form

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Sign in the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the user's document from Firestore to check their status
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 3. Implement the redirect logic
        if (userData.isSeller) {
          if (userData.isVerified) {
            // Seller is verified -> Go to Dashboard
            router.push('/seller/dashboard');
          } else {
            // Seller is not verified -> Go to Verification page
            router.push('/seller/verify');
          }
        } else {
          // User is a buyer -> Go to Homepage
          router.push('/');
        }
      } else {
        // This case is unlikely if sign-up logic is correct, but good to have.
        setError("User data not found.");
        auth.signOut(); // Log them out just in case
      }

    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Error logging in:", err);
    }
  };

  return (
    // This outer container centers the card vertically and horizontally.
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] px-6 py-12 lg:px-8">
      
      {/*
        THIS IS THE PROFESSIONAL "BOXY" CARD:
        - Matches the style of the Sign Up page.
      */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white shadow-xl rounded-lg p-8">
        
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
