import { useState, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Type, Scan, StopCircle } from 'lucide-react';
import { ScanResult } from '@/types/barcode';

interface BarcodeScannerProps {
  onScanSuccess: (result: ScanResult) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      setError(null);
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            onScanSuccess({
              code: result.getText(),
              format: result.getBarcodeFormat()?.toString()
            });
            stopScanning();
          }
        }
      );
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  }, [onScanSuccess]);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReader.current.reset();
    setIsScanning(false);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess({ code: manualCode.trim() });
      setManualCode('');
    }
  };

  return (
    <Card className="shadow-scanner">
      <CardHeader className="bg-gradient-scanner text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            onClick={() => setScanMode('camera')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={scanMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setScanMode('manual')}
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-2" />
            Manual
          </Button>
        </div>

        {/* Camera Scanner */}
        {scanMode === 'camera' && (
          <div className="space-y-4">
            <div className="relative bg-scanner-bg rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-scanner-bg/80">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Click start to begin scanning</p>
                  </div>
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-4 border-2 border-scanner-active rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-scanner-active rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-scanner-active rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-scanner-active rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-scanner-active rounded-br"></div>
                </div>
              )}
            </div>
            
            {error && (
              <Badge variant="destructive" className="w-full justify-center">
                {error}
              </Badge>
            )}
            
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1 bg-gradient-scanner hover:opacity-90">
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex-1">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Manual Input */}
        {scanMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode manually..."
              className="text-lg"
            />
            <Button type="submit" disabled={!manualCode.trim()} className="w-full">
              <Type className="h-4 w-4 mr-2" />
              Add Barcode
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}