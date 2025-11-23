import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Sucesso na leitura
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (errorMessage) => {
          // Erro na leitura (pode ser ignorado se não encontrou código)
          // console.log(errorMessage);
        }
      );
      setError('');
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);
      setError(err.message || 'Erro ao acessar a câmera');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Escanear Código"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="relative bg-black rounded-lg overflow-hidden">
          <div id="reader" className="w-full"></div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Camera className="w-4 h-4" />
          <span>Posicione o código dentro da área destacada</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleClose}
          icon={<X className="w-4 h-4" />}
          fullWidth
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
