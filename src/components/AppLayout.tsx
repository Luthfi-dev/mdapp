
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '@/hooks/use-auth';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdminOrLoginPage = pathname.startsWith('/admin') || pathname === '/login';

  // For admin/login pages, render children directly without the main app layout.
  if (isAdminOrLoginPage) {
    return <AuthProvider>{children}</AuthProvider>;
  }
  
  // For all other pages, show a loader until client-side rendering is ready.
  // This prevents layout shifts and ensures hooks like useIsMobile work correctly.
  if (!isClient) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  // Once the client is ready, render the appropriate layout.
  // The AuthProvider wraps the layout to provide auth context to all app pages.
  return (
    <AuthProvider>
        {isMobile ? (
            <MobileLayout>{children}</MobileLayout>
        ) : (
            <DesktopLayout>{children}</DesktopLayout>
        )}
    </AuthProvider>
  );
}
