
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/messages", label: "Pesan", icon: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 18C16.2091 18 18 16.2091 18 14C18 11.7909 16.2091 10 14 10C11.7909 10 10 11.7909 10 14C10 16.2091 11.7909 18 14 18Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 10C8.32843 10 9 9.32843 9 8.5C9 7.67157 8.32843 7 7.5 7C6.67157 7 6 7.67157 6 8.5C6 9.32843 6.67157 10 7.5 10Z" fill="white"/>
    </svg>
  ), isCenter: true },
  { href: "/notebook", label: "Jurnal", icon: Home }, // This will be replaced by the center button logic
  { href: "/account", label: "Akun", icon: User },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  // Do not render if on admin pages
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }
  
  const navLinks = [
      { href: "/", label: "Beranda", icon: Home },
      { href: "/explore", label: "Jelajah", icon: Compass },
      { href: "/account", label: "Akun", icon: User },
  ];

  const centerItem = { href: "/messages", icon: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 18C16.2091 18 18 16.2091 18 14C18 11.7909 16.2091 10 14 10C11.7909 10 10 11.7909 10 14C10 16.2091 11.7909 18 14 18Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 10C8.32843 10 9 9.32843 9 8.5C9 7.67157 8.32843 7 7.5 7C6.67157 7 6 7.67157 6 8.5C6 9.32843 6.67157 10 7.5 10Z" fill="currentColor"/>
    </svg>
  )};

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-card z-50 shadow-[0_-8px_32px_0_rgba(0,0,0,0.05)] border-t">
      <div className="flex justify-around items-center h-full relative">
        {navLinks.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const isActive = (pathname === href) || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={label} href={href} className="flex flex-col items-center justify-center w-full h-full transition-colors duration-300">
                <div className={cn("flex flex-col items-center gap-1 text-center w-full transition-all duration-300 relative pt-2", isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className={cn("h-6 w-6 transition-all")} />
                  <span className={cn("text-xs font-medium transition-all", isActive ? 'font-bold' : '')}>
                    {label}
                  </span>
                </div>
            </Link>
          );
        })}

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href={centerItem.href}>
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300", 
                    pathname.startsWith(centerItem.href) ? 'bg-primary text-white' : 'bg-primary text-white'
                )}>
                   <centerItem.icon />
                </div>
            </Link>
        </div>

        {navLinks.slice(2).map(({ href, label, icon: Icon }) => {
          const isActive = (pathname === href) || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={label} href={href} className="flex flex-col items-center justify-center w-full h-full transition-colors duration-300">
                <div className={cn("flex flex-col items-center gap-1 text-center w-full transition-all duration-300 relative pt-2", isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className={cn("h-6 w-6 transition-all")} />
                  <span className={cn("text-xs font-medium transition-all", isActive ? 'font-bold' : '')}>
                    {label}
                  </span>
                </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
