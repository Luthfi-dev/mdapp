
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/messages", label: "Pesan", icon: MessageSquare },
  { href: "/account", label: "Akun", icon: User },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-50 px-4">
      <div className="relative flex justify-around items-center h-full max-w-md mx-auto bg-card shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-2xl border">
          {navItems.map(({ href, label, icon: Icon }) => {
             const isActive = (pathname === '/' && href === '/') || (pathname.startsWith(href) && href !== '/');

            return (
              <Link key={label} href={href} className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-colors duration-300">
                  <div className={cn("flex flex-col items-center gap-1 text-center w-full transition-all duration-300", isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                    <div className={cn("w-8 h-1 rounded-full", isActive ? 'bg-primary' : 'bg-transparent -translate-y-2 opacity-0')} />
                    <Icon className={cn("h-6 w-6 transition-all", isActive ? '-translate-y-1' : '')} />
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

    