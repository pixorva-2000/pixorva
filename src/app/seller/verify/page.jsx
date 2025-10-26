// This file is at app/seller/verify/page.jsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Make sure this import path is correct for your file structure
import { useAuth } from '../../../lib/context/AuthContext';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// We'll use lucide-react for a simple loading spinner
// You may need to install it: npm install lucide-react
import { Loader2 } from 'lucide-react'; 

export default function Verify() {
  const { user, loading, isVerified, isSeller } = useAuth();
  const router = useRouter();

  // File state
  const [gstProof, setGstProof] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'pending' or null

  // --- Check verification status on load ---
  useEffect(() => {
    if (loading) return; // Wait for auth to be ready
    
    // 1. If user is verified, send them to the dashboard
    if (isVerified) {
      router.push('/seller/dashboard');
      return;
    }
    
    // 2. If user is not a seller (or not logged in), send them home
    if (!isSeller || !user) {
      router.push('/');
      return;
    }

    // 3. Check for existing 'pending' status in Firestore
    const checkStatus = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().verificationStatus) {
          setVerificationStatus(userDoc.data().verificationStatus);
        }
      }
    };
    checkStatus();

  }, [user, loading, isVerified, isSeller, router]);

  // --- File Input Handlers ---
  const handleGstFile = (e) => {
    setGstProof(e.target.files[0]);
  };
  
  const handleBusinessFile = (e) => {
    setBusinessProof(e.target.files[0]);
  };

  // --- Cloudinary Upload Function ---
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // These env variables are read from your .env.local file
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await res.json();
    if (!data.secure_url) {
      throw new Error('Cloudinary upload failed');
    }
    return data.secure_url; // Returns the secure URL of the uploaded file
  };

  // --- Form Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gstProof || !businessProof) {
      setError('Please upload both documents.');
      return;
    }
    if (!user) {
      setError('You must be logged in to submit.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload both files to Cloudinary in parallel
      const [gstUrl, businessUrl] = await Promise.all([
        uploadFile(gstProof),
        uploadFile(businessProof)
      ]);

      // 2. If uploads are successful, save URLs to Firestore
      if (gstUrl && businessUrl) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          verificationStatus: 'pending',
          documents: {
            gstProofUrl: gstUrl,
            businessProofUrl: businessUrl,
          },
          submittedAt: new Date(),
        });
        
        // 3. Update local state to show the "Pending" message
        setVerificationStatus('pending');
      } else {
        throw new Error('File upload failed. Please try again.');
      }

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---

  // Show loading spinner while auth is checking
  if (loading || (!user && !loading)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
      </div>
    );
  }

  // Show "Pending" message if already submitted
  if (verificationStatus === 'pending') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white shadow-xl rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Verification Pending
          </h2>
          <p className="mt-4 text-gray-600">
            Your documents have been submitted and are under review. We will notify you once your account is verified.
          </p>
        </div>
      </div>
    );
  }

  // Show the upload form
  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white shadow-xl rounded-lg p-8">
        
        {/* --- THIS LINE IS NOW FIXED --- */}
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Verify Your Seller Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please upload the following documents to get verified.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="gst" className="block text-sm font-medium leading-6 text-gray-900">
              GST Proof (PDF, PNG, JPG)
            </label>
            <div className="mt-2">
              <input
                id="gst"
                name="gst"
                type="file"
                required
                onChange={handleGstFile}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="business" className="block text-sm font-medium leading-6 text-gray-900">
              Business Proof (e.g., Electricity Bill)
            </label>
            <div className="mt-2">
              <input
                id="business"
                name="business"
                type="file"
                required
                onChange={handleBusinessFile}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

