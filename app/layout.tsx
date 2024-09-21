'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="bottom-center" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
