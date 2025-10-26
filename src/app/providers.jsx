// This is a new file to "bridge" the gap between
// your Server Component layout and your Client Component context.

"use client"; // This must be a client component

import { AuthProvider } from '../lib/context/AuthContext';

export function Providers({ children }) {
  // We wrap the children (your entire app) in the AuthProvider here
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

