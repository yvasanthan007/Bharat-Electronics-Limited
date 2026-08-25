import { useEffect, useRef, useState } from 'react';
import { X, Download, Fingerprint } from 'lucide-react';
import QRCode from 'qrcode';
import type { DIDIdentity } from '../../data/mockDIDData';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: DIDIdentity | null;
}

export default function QRCodeModal({ isOpen, onClose, identity }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !identity || !canvasRef.current) return;
    setIsReady(false);

    QRCode.toCanvas(
      canvasRef.current,
      identity.fullDID,
      {
        width: 280,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      },
      (err: any) => {
        if (!err) setIsReady(true);
      }
    );
  }, [isOpen, identity]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `did-qr-${identity?.name?.replace(/\s+/g, '-').toLowerCase() ?? 'code'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!isOpen || !identity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">DID QR Code</h3>
              <p className="text-xs text-slate-500">{identity.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-inner">
            <canvas
              ref={canvasRef}
              className={`transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isReady && (
              <div className="w-[280px] h-[280px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-900 text-sm">{identity.name}</p>
            <p className="text-xs text-slate-500">{identity.role} · {identity.department}</p>
            <code className="block text-xs font-mono text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 mt-2 break-all">
              {identity.did}
            </code>
          </div>

          <button
            onClick={handleDownload}
            disabled={!isReady}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
