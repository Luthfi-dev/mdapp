'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { LogIn, Package } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">All-in-One Toolkit</span>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
