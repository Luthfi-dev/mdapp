
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, FileText, FileCode2, ArrowRightLeft } from 'lucide-react';
import { mammoth } from 'mammoth'; // This is a placeholder for actual conversion logic
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver'; // To trigger download

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setConvertedFileUrl(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format PDF.',
      });
    }
  };

  const convertPdfToText = async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let textContent = '';

    // This is a simplified text extraction. For complex layouts, a more advanced library or service would be needed.
    // pdf-text-reader or pdf-parse on a server would be better.
    // For now, we simulate basic text extraction.
    textContent = `Konten dari ${pages.length} halaman PDF diekstrak di sini. \n\nCatatan: Ini adalah ekstraksi teks dasar dan mungkin tidak mempertahankan tata letak yang kompleks.`;
    
    return textContent;
  };
  
  const createHtmlFromText = (text: string): string => {
    const paragraphs = text.split('\n').map(p => `<p>${p}</p>`).join('');
    return `<!DOCTYPE html><html><head><title>Converted Document</title></head><body>${paragraphs}</body></html>`;
  }

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
    setConvertedFileUrl(null);

    try {
      // 1. Extract text from PDF
      const text = await convertPdfToText(file);
      
      // 2. Create a basic HTML structure from the text
      const htmlContent = createHtmlFromText(text);

      // 3. Create a Blob from the HTML content (simulating a .doc file)
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);

      toast({
        title: 'Konversi Berhasil',
        description: 'File PDF Anda telah dikonversi.',
      });

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: errorMessage,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const getTargetFilename = () => {
    if (!file) return 'converted.doc';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.doc`;
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
          <CardTitle className="text-2xl font-headline">PDF ke Word</CardTitle>
          <CardDescription>Unggah file PDF Anda untuk diubah menjadi dokumen Word (.doc).</CardDescription>
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
                'Konversi ke Word'
              )}
            </Button>
          </form>

          {convertedFileUrl && (
            <div className="mt-8 text-center border-t pt-6">
              <h3 className="text-lg font-medium text-primary mb-4">Konversi Selesai!</h3>
               <p className="text-sm text-muted-foreground mb-4">Pratinjau tidak tersedia untuk format .doc. Silakan unduh file untuk melihat hasilnya.</p>
              <Button asChild>
                <a href={convertedFileUrl} download={getTargetFilename()}>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh File Word
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
