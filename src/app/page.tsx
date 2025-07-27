'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, Calendar, Edit, FileText, Lightbulb, Moon, Search } from "lucide-react";

const CategoryCard = ({ icon, label, color, href }: { icon: React.ReactNode, label: string, color: string, href: string }) => (
  <a href={href} className="flex flex-col items-center gap-2 flex-shrink-0">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center`} style={{ background: color }}>
      {icon}
    </div>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </a>
)

const DailyQuizCard = () => (
    <Card className="w-[80vw] sm:w-80 flex-shrink-0 bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-bold">Kuis Harian</h3>
                <p className="text-sm opacity-90">Asah kemampuanmu dengan kuis interaktif</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M9.5 2.1a4.3 4.3 0 0 1 5 0"/><path d="M9.5 13.5c-1.5 0-2.5 1.5-2.5 3.5 0 2.5 1 4 2.5 4s2.5-1.5 2.5-4c0-2-1-3.5-2.5-3.5Z"/><path d="M14.5 13.5c-1.5 0-2.5 1.5-2.5 3.5 0 2.5 1 4 2.5 4s2.5-1.5 2.5-4c0-2-1-3.5-2.5-3.5Z"/><path d="M12 11.5c0-2 1.5-3.5 3-3.5 1.5 0 3.5 1 3.5 3.5 0 1.5-1 2.5-1.5 3a5.2 5.2 0 0 1-1.5 1 5.2 5.2 0 0 1-1.5 1c-.5.2-1 .2-1.5.2a5.2 5.2 0 0 1-1.5-.2c-.5-.2-1-.5-1.5-1a5.2 5.2 0 0 1-1.5-1c-.5-.5-1.5-1.5-1.5-3 0-2.5 2-3.5 3.5-3.5 1.5 0 3 1.5 3 3.5Z"/><path d="M2.5 11.5c0-2 1.5-3.5 3-3.5 1.5 0 3.5 1 3.5 3.5 0 1.5-1 2.5-1.5 3a5.2 5.2 0 0 1-1.5 1A5.2 5.2 0 0 1 5 16a5.2 5.2 0 0 1-1.5-.2c-.5-.2-1-.5-1.5-1a5.2 5.2 0 0 1-1.5-1c-.5-.5-1.5-1.5-1.5-3 0-2.5 2-3.5 3.5-3.5 1.5 0 3 1.5 3 3.5Z"/><path d="M21.5 11.5c0-2-1.5-3.5-3-3.5-1.5 0-3.5 1-3.5 3.5 0 1.5 1 2.5 1.5 3a5.2 5.2 0 0 0 1.5 1 5.2 5.2 0 0 0 1.5.2c.5 0 1 0 1.5-.2a5.2 5.2 0 0 0 1.5-1c.5-.2 1-.5 1.5-1 .5-.5 1.5-1.5 1.5-3 0-2.5-2-3.5-3.5-3.5-1.5 0-3 1.5-3 3.5Z"/></svg>
            </div>
        </CardContent>
    </Card>
);

export default function HomePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-primary rounded-b-[2.5rem] p-6 text-primary-foreground relative z-10">
        <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/30">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/30">
              <Moon className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold">Kursus Interaktif</h1>
            <p className="opacity-80 mt-1 max-w-xs">Nikmati pembelajaran yang menarik dan mendalam</p>
        </div>
      </header>

      <div className="flex-grow px-6 -mt-8 pt-14">
        <div className="grid grid-cols-4 gap-4 mb-8">
            <CategoryCard href="/converter" icon={<FileText className="text-white" />} label="Materi" color="linear-gradient(135deg, #8B5CF6, #6D28D9)" />
            <CategoryCard href="/unit-converter" icon={<BookOpen className="text-white" />} label="Tugas" color="linear-gradient(135deg, #EC4899, #D946EF)" />
            <CategoryCard href="/scanner" icon={<Edit className="text-white" />} label="Ujian" color="linear-gradient(135deg, #3B82F6, #2563EB)" />
            <CategoryCard href="#" icon={<Calendar className="text-white" />} label="Jadwal" color="linear-gradient(135deg, #14B8A6, #0D9488)" />
        </div>

        <ScrollArea className="w-full whitespace-nowrap rounded-lg mb-8">
            <div className="flex space-x-4 pb-4">
                <DailyQuizCard />
                 <Card className="w-[80vw] sm:w-80 flex-shrink-0 bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Latihan Soal</h3>
                            <p className="text-sm opacity-90">Kerjakan soal-soal latihan</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Lightbulb className="text-yellow-400"/> Wawasan Edukasi</h2>
                <a href="#" className="text-sm text-primary font-semibold">Lihat Semua</a>
            </div>
            <div className="space-y-3">
                 <Card className="shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                        <img data-ai-hint="education learning" src="https://placehold.co/100x100.png" alt="Edukasi" className="w-20 h-20 rounded-lg object-cover" />
                        <div>
                            <h3 className="font-bold">Tips Belajar Efektif</h3>
                            <p className="text-sm text-muted-foreground mt-1">Cara memaksimalkan waktu belajar Anda.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                        <img data-ai-hint="technology education" src="https://placehold.co/100x100.png" alt="Teknologi" className="w-20 h-20 rounded-lg object-cover" />
                        <div>
                            <h3 className="font-bold">Teknologi dalam Pendidikan</h3>
                            <p className="text-sm text-muted-foreground mt-1">Peran AI dan teknologi dalam belajar.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </div>
  );
}
