// This file is at lib/context/AuthContext.js

"use client"; // This is a client component

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useMemo // Import useMemo
} from 'react';
// This path is now corrected to look one level up
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- SELLER STATE ---
  const [isSeller, setIsSeller] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  // --- END SELLER STATE ---

  useEffect(() => {
    // This listener handles login/logout
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the Firebase user object
      setLoading(false); // Auth state is now loaded
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // This listener handles Firestore data (isSeller, isVerified)
    if (user) {
      setLoading(true); // Start loading user data
      const userDocRef = doc(db, 'users', user.uid);
      
      // Use onSnapshot for REAL-TIME updates
      const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          // --- UPDATE SELLER STATE ---
          setIsSeller(userData.isSeller || false);
          setIsVerified(userData.isVerified || false);
          // --- END UPDATE SELLER STATE ---
        } else {
          // Handle case where user exists in Auth but not Firestore
          setIsSeller(false);
          setIsVerified(false);
        }
        setLoading(false); // User data is now loaded
      }, (error) => {
        console.error("Error listening to user document:", error);
        setIsSeller(false);
        setIsVerified(false);
        setLoading(false);
      });

      return () => unsubscribeFirestore();
    } else {
      // No user, reset all state
      setIsSeller(false);
      setIsVerified(false);
      setLoading(false); // Not loading if no user
    }
  }, [user]); // This effect depends on the user object

  // Use useMemo to prevent unnecessary re-renders
  // This value will only be recalculated if the state variables change
  const value = useMemo(() => ({
    user,
    loading,
    isSeller,
    isVerified
  }), [user, loading, isSeller, isVerified]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Create the custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};

