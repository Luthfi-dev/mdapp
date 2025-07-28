
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText, BookOpen, ScanLine, Calculator, Palette, Clock, type LucideIcon } from 'lucide-react';
import { ToolCard } from '@/components/ToolCard';

interface App {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const allApps: App[] = [
  { title: 'Konversi File', description: 'Ubah format file dengan mudah', href: '/converter', icon: FileText },
  { title: 'Konversi Unit', description: 'Konversi berbagai satuan', href: '/unit-converter', icon: BookOpen },
  { title: 'Scanner', description: 'Pindai QR dan Barcode', href: '/scanner', icon: ScanLine },
  { title: 'Kalkulator', description: 'Hitung dengan cepat & akurat', href: '/calculator', icon: Calculator },
  { title: 'Generator Warna', description: 'Buat palet warna harmonis', href: '/color-generator', icon: Palette },
  { title: 'Stopwatch', description: 'Ukur waktu dengan presisi', href: '/stopwatch', icon: Clock },
];

export default function AllAppsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = allApps.filter(app =>
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Semua Aplikasi</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Temukan semua alat yang Anda butuhkan di satu tempat.
          </p>
        </div>

        <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari aplikasi..."
              className="w-full rounded-full bg-card text-foreground shadow-sm pl-12 pr-4 py-3 h-14"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-24">
              {filteredApps.map((app) => (
                <ToolCard
                  key={app.title}
                  href={app.href}
                  icon={<app.icon className="w-8 h-8 text-muted-foreground" />}
                  title={app.title}
                  description={app.description}
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aplikasi tidak ditemukan.</p>
            </div>
        )}
       </div>
    </div>
  );
}
