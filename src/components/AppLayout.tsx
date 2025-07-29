
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Exclude AppLayout wrapper for these specific pages
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/messages') {
    return <>{children}</>;
  }
  
  if (!isClient) {
    // Render a placeholder or loader on the server to avoid flash of wrong layout
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
