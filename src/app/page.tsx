import { ToolCard } from "@/components/ToolCard";
import { FileCog, Ruler, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">All-in-One Toolkit</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Your daily essentials, all in one place.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ToolCard
          href="/converter"
          icon={<FileCog className="w-12 h-12 text-primary" />}
          title="File Converter"
          description="Convert documents between popular formats like PDF, DOCX, JPG, and PNG using AI."
        />
        <ToolCard
          href="/unit-converter"
          icon={<Ruler className="w-12 h-12 text-primary" />}
          title="Unit Converter"
          description="Quickly convert units for length, weight, temperature, and more."
        />
        <ToolCard
          href="/scanner"
          icon={<QrCode className="w-12 h-12 text-primary" />}
          title="QR/Barcode Scanner"
          description="Scan QR codes and barcodes instantly using your device's camera."
        />
      </div>
    </div>
  );
}
