
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, FileCode2, ArrowRightLeft, Eye } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { convertHtmlToWord } from '@/ai/flows/file-converter';

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const resetState = () => {
    setFile(null);
    setConvertedFileUrl(null);
    setShowPreview(false);
    setTotalPages(0);
    if (previewRef.current) previewRef.current.innerHTML = '';
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file dengan format PDF.',
      });
       if(e.target) e.target.value = '';
    }
  };

  const renderPdfPreview = async () => {
    if (!file) return;

    setShowPreview(true);
    setIsProcessing(true);

    try {
      if (previewRef.current) previewRef.current.innerHTML = '';
      
      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      setTotalPages(pdf.numPages);

      let fullTextContent = '';
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as any).str).join(' ');
        fullTextContent += `<div class="page-break"><p>${pageText.replace(/\n/g, '<br/>')}</p></div>`;
      }
      if(previewRef.current) {
        previewRef.current.innerHTML = fullTextContent;
      }

    } catch (error) {
      console.error("PDF Preview Error:", error);
      toast({ variant: "destructive", title: "Gagal Mempratinjau", description: "Tidak dapat merender file PDF." });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleConvertToWord = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'File Belum Dipilih', description: 'Silakan pilih file PDF terlebih dahulu.' });
      return;
    }

    setIsProcessing(true);
    setConvertedFileUrl(null);

    try {
      let htmlContent = '';
      if(previewRef.current && previewRef.current.innerHTML) {
          htmlContent = previewRef.current.innerHTML;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let fullTextContent = '';
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => (item as any).str).join(' ');
           fullTextContent += `<p>${pageText.replace(/\n/g, '<br/>')}</p>`;
        }
        htmlContent = fullTextContent;
      }
      
      const response = await convertHtmlToWord({
        htmlContent: htmlContent,
        filename: file.name.replace(/\.pdf$/i, '.docx'),
      });

      if (response.docxDataUri) {
        setConvertedFileUrl(response.docxDataUri);
        toast({
          title: 'Konversi Berhasil!',
          description: 'File Anda siap untuk diunduh.',
        });
      } else {
        throw new Error(response.error || 'Gagal mengonversi file di server.');
      }
    } catch (error) {
      console.error('Conversion Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
      toast({
        variant: 'destructive',
        title: 'Kesalahan Konversi',
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (convertedFileUrl && file) {
       saveAs(convertedFileUrl, file.name.replace(/\.pdf$/i, '.docx'));
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-red-500" />
            <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
            <FileCode2 className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-headline">PDF ke Word (Tata Letak Visual)</CardTitle>
          <CardDescription>Konversi PDF ke dokumen Word dengan mempertahankan tata letak visual asli.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File PDF</Label>
              <Input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} />
              {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
            </div>

            {file && (
              <div className="flex justify-center items-center gap-4">
                {convertedFileUrl ? (
                  <Button onClick={handleDownload} className="w-full">
                    Unduh File Word
                  </Button>
                ) : (
                  <Button onClick={handleConvertToWord} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengonversi...
                      </>
                    ) : (
                      'Konversi ke Word'
                    )}
                  </Button>
                )}
                 <Button variant="outline" size="icon" onClick={renderPdfPreview} disabled={isProcessing}>
                    <Eye className="h-5 w-5" />
                 </Button>
              </div>
            )}
            
            {showPreview && (
              <div className="border rounded-md p-4 bg-secondary">
                 <h4 className="font-bold mb-2 text-center">Pratinjau Teks Dokumen ({totalPages} Halaman)</h4>
                 {isProcessing && !previewRef.current?.hasChildNodes() && (
                    <div className="text-center text-muted-foreground p-4">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                      <p>Mengekstrak teks...</p>
                    </div>
                 )}
                <div 
                  ref={previewRef} 
                  contentEditable={true}
                  className="bg-white p-4 shadow-inner h-96 overflow-auto"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
