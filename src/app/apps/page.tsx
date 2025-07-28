
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText, BookOpen, ScanLine, Calculator, Palette, Clock, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Semua Aplikasi</CardTitle>
          <CardDescription>Temukan semua alat yang Anda butuhkan di satu tempat.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari aplikasi..."
              className="w-full rounded-full bg-secondary pl-10 pr-4 py-2 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredApps.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <ToolCard
                  key={app.title}
                  href={app.href}
                  icon={<app.icon className="w-10 h-10 text-primary" />}
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
        </CardContent>
      </Card>
    </div>
  );
}
