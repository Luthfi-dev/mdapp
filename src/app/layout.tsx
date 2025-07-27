
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import BottomNavBar from '@/components/BottomNavBar';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'All-in-One Toolkit',
  description: 'A versatile utility app with daily tools.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col bg-background")}>
        <main className="flex-grow">
          {children}
        </main>
        <BottomNavBar />
        <Toaster />
      </body>
    </html>
  );
}

    
