
'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Lock, Mail, User, AlertTriangle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// A simple function to generate a browser fingerprint
const getBrowserFingerprint = () => {
  if (typeof window === 'undefined') return 'server-side-render';
  
  const { userAgent, language, platform, hardwareConcurrency, deviceMemory } = navigator;
  const screenResolution = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = new Date().getTimezoneOffset();
  
  const data = `${userAgent}|${language}|${platform}|${hardwareConcurrency}|${deviceMemory}|${screenResolution}|${timezone}`;
  
  // Simple hash function (not cryptographically secure, but good enough for a fingerprint)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};


export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const { isLoading, login, register, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
        router.push('/account/profile');
    }
  }, [isAuthenticated, user, router]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const repeatPassword = formData.get("repeatPassword") as string;
    
    try {
        if (isLogin) {
            const result = await login(email, password);
            if (result.success) {
                 toast({
                    title: 'Login Berhasil!',
                    description: result.message,
                });
                router.push('/account/profile');
            } else {
                setServerError(result.message || 'Terjadi kesalahan.');
            }
        } else {
            const fingerprint = getBrowserFingerprint();
            const result = await register({name, email, password, repeatPassword, fingerprint});
            if (result.success) {
                toast({
                    title: 'Registrasi Berhasil!',
                    description: result.message,
                });
                setIsLogin(true);
            } else {
                 setServerError(result.message || 'Terjadi kesalahan.');
            }
        }
    } catch(error) {
         setServerError(error instanceof Error ? error.message : 'Tidak dapat terhubung ke server.');
    }
  };
  
  if (isAuthenticated === undefined || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="name" name="name" type="text" placeholder="Nama Lengkap" className="pl-10 h-12 rounded-full" required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="pl-10 h-12 rounded-full" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type="password" required placeholder="Kata Sandi" className="pl-10 h-12 rounded-full" />
              </div>
              {!isLogin && (
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="repeatPassword" name="repeatPassword" type="password" required placeholder="Ulangi Kata Sandi" className="pl-10 h-12 rounded-full" />
                </div>
              )}
              
               {serverError && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>
                       {serverError}
                    </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-lg font-bold group" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {isLogin ? "Masuk" : "Daftar"}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary hover:underline" disabled={isLoading}>
                {isLogin ? "Daftar sekarang" : "Masuk"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
