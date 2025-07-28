
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileCode2, FileText, ArrowRightLeft, Download } from 'lucide-react';
import * as docx from 'docx-preview';
import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 1280,
  userScalable: true,
};

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (!selectedFile.name.endsWith('.docx')) {
            toast({
                variant: 'destructive',
                title: 'File Tidak Valid',
                description: 'Silakan pilih file dengan format .docx',
            });
            setFile(null);
            if(previewRef.current) previewRef.current.innerHTML = '';
            return;
        }
        
        setFile(selectedFile);
        setConvertedFileUrl(null);

        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target?.result;
            if (arrayBuffer && previewRef.current) {
                previewRef.current.innerHTML = '';
                docx.renderAsync(arrayBuffer as ArrayBuffer, previewRef.current)
                    .catch(error => {
                        console.error("Error rendering docx:", error);
                        toast({
                            variant: "destructive",
                            title: "Gagal Mempratinjau",
                            description: "Gagal merender file Word. File mungkin rusak atau tidak didukung."
                        })
                    });
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleConvertToPdf = async () => {
    if (!previewRef.current || !previewRef.current.hasChildNodes()) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada Konten',
        description: 'Tidak ada pratinjau untuk dikonversi. Silakan unggah file terlebih dahulu.',
      });
      return;
    }

    setIsConverting(true);
    setConvertedFileUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const docxWrapper = previewRef.current.querySelector('.docx-wrapper');

      if (!docxWrapper) {
          throw new Error('Tidak dapat menemukan konten wrapper .docx untuk dikonversi.');
      }
      
      const pages = docxWrapper.querySelectorAll('.docx');
      
      if(pages.length === 0) {
        // Fallback for single page documents that might not have the .docx class on the page itself
        const canvas = await html2canvas(docxWrapper as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdfImage = await pdfDoc.embedPng(imgData);
        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
        page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
        });

      } else {
        for (let i = 0; i < pages.length; i++) {
          const pageElement = pages[i] as HTMLElement;
          const canvas = await html2canvas(pageElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const pdfImage = await pdfDoc.embedPng(imgData);

          const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
          page.drawImage(pdfImage, {
              x: 0,
              y: 0,
              width: page.getWidth(),
              height: page.getHeight(),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);

      toast({
        title: 'Konversi Berhasil',
        description: 'File Word Anda telah berhasil dikonversi ke PDF.',
      });

    } catch (error) {
      console.error("PDF Conversion Error:", error);
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
  
  const getTargetFilename = () => {
    if (!file) return 'converted.pdf';
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.pdf`;
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
          <CardTitle className="text-2xl font-headline">Word ke PDF (Tata Letak Presisi)</CardTitle>
          <CardDescription>Ubah file Word (.docx) menjadi PDF dengan tata letak yang sama persis.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Pilih File Word (.docx)</Label>
                    <Input id="file-upload" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
                    {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
                </div>

                {file && (
                    <div className="space-y-4">
                        <Button onClick={handleConvertToPdf} className="w-full" disabled={isConverting}>
                        {isConverting ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengonversi ke PDF...
                            </>
                        ) : (
                            'Konversi ke PDF'
                        )}
                        </Button>
                        
                        <div className="border rounded-md p-4 bg-secondary">
                          <h4 className="font-bold mb-2 text-center">Pratinjau Dokumen</h4>
                          <div ref={previewRef} className="bg-white p-2 shadow-inner h-96 overflow-auto"></div>
                        </div>
                    </div>
                )}
                
                {convertedFileUrl && (
                    <div className="mt-8 border-t pt-6 space-y-4 text-center">
                        <h3 className="text-lg font-medium text-primary">Konversi Selesai!</h3>
                        <Button asChild>
                            <a href={convertedFileUrl} download={getTargetFilename()}>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh File PDF
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
