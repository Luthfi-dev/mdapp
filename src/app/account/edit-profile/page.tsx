
'use client';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, Camera, Loader2, Mail, Save, User } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { optimizeImage } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder data - in a real app, this would come from a session/context
const user = {
    name: 'Sana Afzal',
    email: 'sana.afzal22@gmail.com',
    phone: '',
    avatar: 'https://placehold.co/128x128.png',
    initials: 'SA'
};

export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
             if (!file.type.startsWith('image/')) {
                toast({ variant: 'destructive', title: 'File Tidak Valid', description: 'Hanya file gambar yang diizinkan.' });
                return;
            }
            try {
                const optimizedFile = await optimizeImage(file, 256); // Optimize to 256px
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result as string;
                    setAvatarPreview(dataUrl);
                    // In a real app, you would probably upload this to a server and get back a URL
                    // For now, we'll use the data URL for preview.
                };
                reader.readAsDataURL(optimizedFile);
            } catch (error) {
                console.error("Image optimization failed:", error);
                toast({ variant: 'destructive', title: 'Gagal Memproses Gambar' });
            }
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Saving data:", { name, phone, avatar: avatarPreview });
            toast({
                title: "Profil Diperbarui!",
                description: "Perubahan pada profil Anda telah berhasil disimpan."
            });
            setIsSaving(false);
            router.push('/account/profile');
        }, 1500);
    }

    return (
        <div className="min-h-screen bg-secondary/30">
             <div className="container mx-auto max-w-2xl px-4 py-8 pb-24">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profil</CardTitle>
                        <CardDescription>Perbarui informasi pribadi dan foto profil Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                             <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-32 h-32 text-5xl">
                                        <AvatarImage src={avatarPreview} data-ai-hint="profile picture" />
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                    </Avatar>
                                     <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="icon" 
                                        className="absolute bottom-1 right-1 rounded-full h-10 w-10 bg-background"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="w-5 h-5" />
                                    </Button>
                                    <Input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10"/>
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                 <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" value={user.email} disabled className="pl-10"/>
                                </div>
                                <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                                 <div className="relative">
                                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                     <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contoh: 08123456789" className="pl-10"/>
                                 </div>
                            </div>

                            <Button type="submit" disabled={isSaving} className="w-full">
                                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2" />}
                                Simpan Perubahan
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
