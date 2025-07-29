
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Star, Flame, type LucideIcon } from 'lucide-react';
import { ToolCard } from '@/components/ToolCard';
import type { AppDefinition } from '@/app/admin/apps/page';
import * as LucideIcons from 'lucide-react';
import appsData from '@/data/apps.json';

const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
        return <IconComponent className="w-8 h-8 text-primary" />;
    }
    return <LucideIcons.Package className="w-8 h-8 text-primary" />;
};


export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allApps, setAllApps] = useState<AppDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch and load favorites from localStorage
    const sortedApps = [...appsData].sort((a, b) => a.order - b.order);
    setAllApps(sortedApps);
    setIsLoading(false);
  }, []);


  const filteredApps = allApps.filter(app =>
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popular = filteredApps.filter(app => app.isPopular);
  const others = filteredApps.filter(app => !app.isPopular);

  const renderAppGrid = (apps: AppDefinition[], title: string, icon?: React.ReactNode) => {
    if (apps.length === 0) return null;
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">{icon}{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <ToolCard
              key={app.id}
              href={app.href}
              icon={getIcon(app.icon)}
              title={app.title}
              description={app.description}
            />
          ))}
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-headline tracking-tight">Jelajahi Semua Alat</h1>
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
            <div className="pb-24">
              {renderAppGrid(popular, "Populer", <Flame className="text-orange-500" />)}
              {renderAppGrid(others, "Alat Lainnya")}
            </div>
        ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aplikasi tidak ditemukan untuk "{searchTerm}".</p>
            </div>
        )}
       </div>
    </div>
  );
}

