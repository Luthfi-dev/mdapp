
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileCode2, FileText, ArrowRightLeft, Download } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
      if (previewRef.current) {
        renderAsync(selectedFile, previewRef.current)
          .then(() => {
             toast({ title: 'Pratinjau Siap', description: 'Dokumen Anda telah dimuat untuk pratinjau.' });
          });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format .docx',
      });
      setFile(null);
    }
  };

  const handleConvertToPdf = async () => {
    if (!previewRef.current || !file) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File',
        description: 'Silakan pilih file DOCX terlebih dahulu.',
      });
      return;
    }

    setIsConverting(true);

    try {
        const canvas = await html2canvas(previewRef.current, {
            scale: 2, // Meningkatkan resolusi
            useCORS: true, 
            logging: false
        });

        if (!canvas) {
            throw new Error("Gagal membuat kanvas dari pratinjau.");
        }

        const imgData = canvas.toDataURL('image/png');
        
        const pdfDoc = await PDFDocument.create();
        const pngImage = await pdfDoc.embedPng(imgData);

        // Menggunakan dimensi kanvas untuk ukuran halaman PDF
        const page = pdfDoc.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const targetFilename = `${file.name.replace(/\.docx$/, '')}.pdf`;
        saveAs(blob, targetFilename);

        toast({
            title: 'Konversi Berhasil',
            description: 'File Word Anda telah berhasil dikonversi ke PDF.',
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
        toast({
            variant: 'destructive',
            title: 'Gagal Mengonversi',
            description: errorMessage,
        });
    } finally {
        setIsConverting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FileCode2 className="w-12 h-12 text-blue-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileText className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Word ke PDF</CardTitle>
          <CardDescription>Konversi file .docx ke PDF dengan tata letak yang sama persis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File DOCX</Label>
              <Input id="file-upload" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground mt-2">File dipilih: {file.name}</p>}
            </div>

            <Button onClick={handleConvertToPdf} className="w-full" disabled={isConverting || !file}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengonversi...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Konversi ke PDF & Unduh
                </>
              )}
            </Button>
            
            <div>
                <Label>Pratinjau Dokumen</Label>
                <div ref={previewRef} className="mt-2 border rounded-md bg-white min-h-[400px] max-h-[800px] overflow-auto p-4">
                   {!file && <p className="text-center text-muted-foreground py-10">Pilih file untuk melihat pratinjau</p>}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
