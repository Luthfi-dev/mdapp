'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Copy, Loader2, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ScannerPage() {
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      const mockData = `https://example.com/product/${Math.random().toString(36).substring(7)}`;
      setScannedData(mockData);
      setIsScanning(false);
      toast({
        title: 'Scan Successful',
        description: 'A QR code has been detected.',
      });
    }, 1500);
  };

  const handleCopy = () => {
    if (scannedData) {
      navigator.clipboard.writeText(scannedData);
      toast({
        title: 'Copied to Clipboard',
        description: 'The scanned data has been copied.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">QR/Barcode Scanner</CardTitle>
          <CardDescription>Point your camera at a code to scan it. This is a simulation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <Camera className="w-24 h-24 text-gray-700" />
            {isScanning && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="relative w-full h-full overflow-hidden">
                   <ScanLine className="absolute w-full h-1 bg-accent/50 shadow-[0_0_10px_1px_#87CEEB] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
             <style jsx>{`
              @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
              }
            `}</style>
          </div>

          <Button onClick={handleScan} className="w-full" disabled={isScanning}>
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              'Start Scan'
            )}
          </Button>

          {scannedData && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Scanned Data:</h3>
              <div className="relative">
                <Textarea readOnly value={scannedData} className="pr-10" />
                <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
