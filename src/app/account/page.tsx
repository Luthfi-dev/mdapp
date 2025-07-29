'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ChevronRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function AccountPage() {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold font-headline text-foreground tracking-tight">
              {isLogin ? "Selamat Datang" : "Buat Akun"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Masuk untuk melanjutkan" : "Mulai perjalananmu bersama kami"}
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl">
            <form className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="name" type="text" placeholder="Nama Lengkap" className="pl-10 h-12 rounded-full" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-10 h-12 rounded-full" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" required placeholder="Kata Sandi" className="pl-10 h-12 rounded-full" />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     {/* Checkbox can be added here */}
                  </div>
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Login sebagai Admin?
                  </Link>
                </div>
              )}
              
              <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-lg font-bold group">
                {isLogin ? "Masuk" : "Daftar"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary hover:underline">
                {isLogin ? "Daftar sekarang" : "Masuk"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
