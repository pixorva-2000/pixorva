// This file is at app/layout.jsx

import './globals.css';
// We'll use the 'Inter' font, which is clean and professional
import { Inter } from 'next/font/google';
// FIX: Changed to a named import { Providers }
import { Providers } from './providers';
import Navbar from '../components/Navbar';

// Setup the font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter' // Use CSS variable for fonts
});

export const metadata = {
  title: 'Pixorva',
  description: 'Your new marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*
        HERE IS THE FIX:
        - We apply the light gray background (bg-gray-50) to the whole body.
        - We set min-h-screen to ensure it always fills the page.
        - We apply the 'inter' font for a professional look.
      */}
      <body 
        className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

