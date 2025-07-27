'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ArrowRight, BookOpen, BrainCircuit, Edit, FileText, Lightbulb, Moon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Autoplay from "embla-carousel-autoplay"
import React from "react";

const CategoryCard = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <a href={href} className="flex flex-col items-center gap-2 flex-shrink-0 w-20 text-center">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
  </a>
)

const DailyQuizCard = () => (
    <Card className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-5 flex flex-col justify-between h-full relative">
            <div className="z-10">
                <h3 className="text-lg font-bold">Kuis Harian</h3>
                <p className="text-sm opacity-90 mt-1 max-w-[150px]">Asah kemampuanmu dengan kuis interaktif</p>
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center z-0">
                 <BrainCircuit className="text-white w-8 h-8"/>
            </div>
        </CardContent>
    </Card>
);

const LatihanSoalCard = () => (
    <Card className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-5 flex flex-col justify-between h-full relative">
             <div className="z-10">
                <h3 className="text-lg font-bold">Latihan Soal</h3>
                <p className="text-sm opacity-90 mt-1 max-w-[150px]">Perbanyak latihan untuk persiapan ujian.</p>
            </div>
             <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center z-0">
                 <Edit className="text-white w-8 h-8"/>
            </div>
        </CardContent>
    </Card>
)

export default function HomePage() {
   const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true })
  )
  return (
    <div className="flex flex-col h-full bg-background overflow-x-hidden">
      <header className="p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
                <p className="text-muted-foreground text-sm">Selamat Datang!</p>
                <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Moon className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kursus atau materi..."
              className="w-full rounded-full bg-secondary pl-10 pr-4 py-2 h-12 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
        </div>
      </header>

      <main className="flex-grow px-6 pb-28">
        <section id="features" className="mb-8">
            <div className="flex justify-around items-start">
                <CategoryCard href="/converter" icon={<FileText className="text-primary" />} label="Konversi File" />
                <CategoryCard href="/unit-converter" icon={<BookOpen className="text-primary" />} label="Konversi Unit" />
                <CategoryCard href="/scanner" icon={<Edit className="text-primary" />} label="Scanner" />
                <CategoryCard href="#" icon={<Lightbulb className="text-primary" />} label="Fitur Lain" />
            </div>
        </section>

        <section id="interactive-cards" className="mb-8 -mx-4">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              <CarouselItem className="basis-4/5 md:basis-1/2 pl-4">
                <div className="p-1 h-36">
                  <DailyQuizCard />
                </div>
              </CarouselItem>
              <CarouselItem className="basis-4/5 md:basis-1/2 pl-4">
                <div className="p-1 h-36">
                 <LatihanSoalCard />
                </div>
              </CarouselItem>
               <CarouselItem className="basis-4/5 md:basis-1/2 pl-4">
                <div className="p-1 h-36">
                  <DailyQuizCard />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </section>
        
        <section id="insights">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">Wawasan Edukasi</h2>
                <a href="#" className="text-sm text-primary font-semibold">Lihat Semua</a>
            </div>
            <div className="space-y-4">
                 <Card className="shadow-sm border-0 bg-secondary">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <img data-ai-hint="education learning" src="https://placehold.co/100x100.png" alt="Edukasi" className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                            <h3 className="font-bold leading-tight">Tips Belajar Efektif di Era Digital</h3>
                            <p className="text-sm text-muted-foreground mt-1">Maksimalkan waktumu dengan metode yang terbukti.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                            <ArrowRight className="w-4 h-4 text-muted-foreground"/>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm border-0 bg-secondary">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <img data-ai-hint="technology education" src="https://placehold.co/100x100.png" alt="Teknologi" className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                            <h3 className="font-bold leading-tight">Teknologi dalam Pendidikan</h3>
                            <p className="text-sm text-muted-foreground mt-1">Peran AI dan teknologi dalam proses belajar.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                            <ArrowRight className="w-4 h-4 text-muted-foreground"/>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
      </main>
    </div>
  );
}
