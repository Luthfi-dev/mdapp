
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, FileCode2, FileText, ArrowRightLeft } from 'lucide-react';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx'))) {
      setFile(selectedFile);
      setConvertedFileUrl(null);
      setPreviewContent(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format .docx.',
      });
    }
  };
  
  const convertHtmlToPdf = async (html: string): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // This is a very basic conversion. It does not handle complex HTML styling.
    // It simply draws the text content.
    const textContent = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    
    page.drawText(textContent, {
      x: 50,
      y: height - 4 * 50,
      font,
      size: 12,
      color: rgb(0, 0, 0),
      maxWidth: width - 100,
      lineHeight: 15,
    });
    
    return pdfDoc.save();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada file',
        description: 'Silakan pilih file .docx untuk dikonversi.',
      });
      return;
    }

    setIsConverting(true);
    setConvertedFileUrl(null);
    setPreviewContent(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 1. Convert DOCX to HTML using Mammoth
      const { value: htmlResult } = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewContent(htmlResult);

      // 2. Convert HTML to PDF using pdf-lib
      const pdfBytes = await convertHtmlToPdf(htmlResult);
      
      // 3. Create a Blob and URL for download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);

      toast({
        title: 'Konversi Berhasil',
        description: 'File Word Anda telah dikonversi menjadi PDF.',
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
    if (!file) return 'converted.pdf';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.pdf`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-4 mb-4">
            <FileCode2 className="w-12 h-12 text-blue-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileText className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Word ke PDF</CardTitle>
          <CardDescription>Unggah file .docx Anda untuk diubah menjadi dokumen PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File .docx</Label>
              <Input id="file-upload" type="file" accept=".docx" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isConverting || !file}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengonversi...
                </>
              ) : (
                'Konversi ke PDF'
              )}
            </Button>
          </form>

          {convertedFileUrl && (
             <div className="mt-8 border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-primary text-center">Pratinjau & Unduh</h3>
              <div className="border rounded-md p-4 bg-secondary max-h-60 overflow-y-auto">
                 {previewContent && (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
                 )}
              </div>
              <div className="text-center">
                <Button asChild>
                    <a href={convertedFileUrl} download={getTargetFilename()}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh File PDF
                    </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
