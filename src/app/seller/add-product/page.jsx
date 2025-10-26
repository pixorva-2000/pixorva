// This file is at app/seller/add-product/page.jsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import SellerDashboard from '../dashboard/page'; // We import this for its protection logic

export default function AddProduct() {
  const { user, loading, isSeller, isVerified } = useAuth();
  const router = useRouter();

  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Cloudinary Upload Function ---
  // This is the same function from the verification page
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
    if (!productName || !description || !price || !productImage) {
      setError('Please fill out all fields and upload an image.');
      return;
    }
    if (!user) {
      setError('You must be logged in.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload the product image to Cloudinary
      const imageUrl = await uploadFile(productImage);

      // 2. If upload is successful, save product to 'products' collection in Firestore
      if (imageUrl) {
        // We are creating a NEW document in the 'products' collection
        await addDoc(collection(db, 'products'), {
          sellerId: user.uid,
          sellerEmail: user.email,
          name: productName,
          description: description,
          price: parseFloat(price), // Store price as a number
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        });
        
        // 3. Redirect back to the dashboard after success
        router.push('/seller/dashboard');
      } else {
        throw new Error('Image upload failed. Please try again.');
      }

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Protection and Render Logic ---
  // This is a simple way to protect this page
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
      </div>
    );
  }

  // If user is not a verified seller, they see nothing (or get redirected by the logic in SellerDashboard)
  // We render the dashboard component, which contains its own redirect logic.
  if (!user || !isSeller || !isVerified) {
    return <SellerDashboard />;
  }

  // Show the "Add Product" form
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Add a New Product
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="productName" className="block text-sm font-medium leading-6 text-gray-900">
              Product Name
            </label>
            <div className="mt-2">
              <input
                id="productName"
                name="productName"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Description
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
              Price ($)
            </label>
            <div className="mt-2">
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
              Product Image
            </label>
            <div className="mt-2">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg"
                required
                onChange={(e) => setProductImage(e.target.files[0])}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/seller/dashboard')}
              className="flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold leading-6 text-gray-900 shadow-sm hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
