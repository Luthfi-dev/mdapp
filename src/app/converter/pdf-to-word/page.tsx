
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, FileCode2, ArrowRightLeft } from 'lucide-react';
import { saveAs } from 'file-saver';
import { convertPdfToWord } from '@/ai/flows/file-converter';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format PDF.',
      });
      setFile(null);
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const getTargetFilename = () => {
    if (!file) return 'converted.docx';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.docx`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada file',
        description: 'Silakan pilih file PDF untuk dikonversi.',
      });
      return;
    }

    setIsConverting(true);

    try {
      const dataUri = await toBase64(file);
      
      const result = await convertPdfToWord({ fileDataUri: dataUri, filename: file.name });
      
      if (result.error) {
         throw new Error(result.error);
      }
      
      if (result.docxDataUri) {
        saveAs(result.docxDataUri, getTargetFilename());

        toast({
          title: 'Konversi Berhasil',
          description: 'File PDF Anda telah berhasil dikonversi dan diunduh.',
        });
      } else {
        throw new Error('Konversi gagal: tidak ada konten yang diterima.');
      }

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: `Gagal mengonversi file: ${errorMessage}`,
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-red-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileCode2 className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-headline">PDF ke Word (AI Layout)</CardTitle>
          <CardDescription>Unggah file PDF Anda untuk diubah menjadi dokumen Word (.docx) dengan analisis tata letak oleh AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File PDF</Label>
              <Input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isConverting || !file}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengonversi...
                </>
              ) : (
                'Konversi & Unduh Otomatis'
              )}
            </Button>
          </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Didukung oleh AI untuk menganalisis dan mempertahankan tata letak. Hasil mungkin memerlukan penyesuaian manual.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
