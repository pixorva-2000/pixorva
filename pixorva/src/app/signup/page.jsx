// This file is at app/signup/page.jsx

"use client"; // This must be a client component for the form

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('buyer'); // 'buyer' or 'seller'
  
  // Seller-specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (accountType === 'seller' && (!businessName || !businessAddress)) {
      setError("Business name and address are required for sellers.");
      return;
    }

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Prepare the user document for Firestore
      let userData = {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        accountType: accountType,
        isSeller: accountType === 'seller',
        isVerified: false, // ALL users start as unverified
        createdAt: new Date(),
      };

      if (accountType === 'seller') {
        userData.businessName = businessName;
        userData.businessAddress = businessAddress;
      }

      // 3. Create the user document in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // 4. Redirect to the correct page
      // If they are a seller, send them to the verification page.
      // If they are just a buyer, send them to the homepage.
      if (accountType === 'seller') {
        router.push('/seller/verify');
      } else {
        router.push('/');
      }

    } catch (err)
 {
      setError(err.message);
      console.error("Error signing up:", err);
    }
  };

  return (
    // This outer container centers the card vertically and horizontally.
    // We use min-h-[calc(100vh-64px)] to subtract the navbar height (approx. 64px)
    // and perfectly center the content in the remaining space.
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] px-6 py-12 lg:px-8">
      
      {/*
        THIS IS THE NEW PROFESSIONAL "BOXY" CARD:
        - It has a white background (bg-white).
        - It has a large shadow (shadow-xl) and rounded corners (rounded-lg).
        - It has padding (p-8) so the content isn't on the edge.
      */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white shadow-xl rounded-lg p-8">
        
        {/* The title is now INSIDE the card */}
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create your Pixorva account
        </h2>

        {/* The form is also INSIDE the card, with new margin-top */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Account Type Toggle */}
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Account Type</label>
            <fieldset className="mt-2">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="buyer"
                    checked={accountType === 'buyer'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                  />
                  <span className="ml-2 text-sm text-gray-700">I'm a Buyer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="seller"
                    checked={accountType === 'seller'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                  />
                  <span className="ml-2 text-sm text-gray-700">I'm a Seller</span>
                </label>
              </div>
            </fieldset>
          </div>

          {/* Standard Fields */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900">
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          
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
              Password (min. 6 characters)
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Conditional Seller Fields */}
          {/* This also gets a "boxy" design */}
          {accountType === 'seller' && (
            <div className="space-y-6 p-4 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Business Details</h3>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium leading-6 text-gray-900">
                  Business Name
                </label>
                <div className="mt-2">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium leading-6 text-gray-900">
                  Business Address
                </label>
                <div className="mt-2">
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows="3"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            {/* This button is now dark gray/black to match the Navbar
              for a more professional, unified brand.
            */}
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

