'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { convertFile, type ConvertFileInput } from '@/ai/flows/file-converter';
import { Download, Loader2, UploadCloud } from 'lucide-react';

type SupportedFormats = 'pdf' | 'docx' | 'png' | 'jpg' | 'txt' | 'md';

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<SupportedFormats>('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedFileUrl(null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to convert.',
      });
      return;
    }

    setIsConverting(true);
    setConvertedFileUrl(null);

    try {
      const fileDataUri = await fileToDataUri(file);
      const input: ConvertFileInput = { fileDataUri, targetFormat };
      
      const result = await convertFile(input);

      if (result.convertedFileDataUri) {
        setConvertedFileUrl(result.convertedFileDataUri);
        toast({
          title: 'Conversion Successful',
          description: `Your file has been converted to ${targetFormat}.`,
        });
      } else {
        throw new Error('Conversion failed: No file data returned.');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Conversion Error',
        description: errorMessage,
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  const getTargetFilename = () => {
    if (!file) return `converted.${targetFormat}`;
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${originalName}.${targetFormat}`;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">AI File Converter</CardTitle>
          <CardDescription>Select a file and choose the format you want to convert it to.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      {file ? file.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                    </p>
                  </div>
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-format">Target Format</Label>
              <Select onValueChange={(value: SupportedFormats) => setTargetFormat(value)} defaultValue={targetFormat}>
                <SelectTrigger id="target-format">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                  <SelectItem value="md">Markdown (MD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isConverting || !file}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert File'
              )}
            </Button>
          </form>

          {convertedFileUrl && (
            <div className="mt-6 text-center">
              <p className="text-lg font-medium text-primary mb-4">Your file is ready!</p>
              <Button asChild>
                <a href={convertedFileUrl} download={getTargetFilename()}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Converted File
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
