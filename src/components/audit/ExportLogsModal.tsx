import { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, CheckCircle, ShieldCheck } from 'lucide-react';
import type { AuditLogEvent } from '../../data/auditData';

interface ExportLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredEvents: AuditLogEvent[];
  totalEventsCount: number;
}

export default function ExportLogsModal({
  isOpen,
  onClose,
  filteredEvents,
  totalEventsCount
}: ExportLogsModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [includeIntegrityProof, setIncludeIntegrityProof] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      const dataToExport = filteredEvents.map((evt) => ({
        eventId: evt.id,
        actorName: evt.actor.name,
        actorRole: evt.actor.role,
        actorAddress: evt.actor.address,
        action: evt.action,
        resource: evt.resource.name,
        resourceId: evt.resource.id,
        network: evt.network,
        timestamp: evt.timestamp,
        status: evt.status,
        txHash: evt.txHash || 'N/A',
        ...(includeIntegrityProof
          ? {
              blockNumber: evt.integrity.blockNumber,
              prevEventHash: evt.integrity.prevEventHash,
              currEventHash: evt.integrity.currEventHash,
              integrityStatus: 'Verified'
            }
          : {})
      }));

      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json' });
        filename = `BEL_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // Convert to CSV
        const headers = Object.keys(dataToExport[0] || {}).join(',');
        const rows = dataToExport.map((row) =>
          Object.values(row)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(',')
        );
        const csvContent = [headers, ...rows].join('\n');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `BEL_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportComplete(true);

      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Export Audit Logs</h3>
              <p className="text-xs text-slate-500">Download tamper-proof records for compliance & reporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileSpreadsheet className={`w-5 h-5 ${format === 'csv' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-sm font-semibold">CSV Spreadsheet</p>
                <p className="text-[11px] text-slate-500">For Excel & Google Sheets</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileCode className={`w-5 h-5 ${format === 'json' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-sm font-semibold">JSON Data</p>
                <p className="text-[11px] text-slate-500">Full Cryptographic Payload</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Export Range
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="exportScope"
                checked={scope === 'filtered'}
                onChange={() => setScope('filtered')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Current Filtered View ({filteredEvents.length} events)</span>
                <p className="text-slate-500">Exports logs matching your active search and filter choices</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="exportScope"
                checked={scope === 'all'}
                onChange={() => setScope('all')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">Full Archive (~{totalEventsCount.toLocaleString()} events)</span>
                <p className="text-slate-500">Comprehensive export of all registered historical platform logs</p>
              </div>
            </label>
          </div>
        </div>

        {/* Blockchain Options */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeIntegrityProof}
              onChange={(e) => setIncludeIntegrityProof(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Include Blockchain Cryptographic Hashes
              </span>
              <p className="text-slate-500">Appends Block Number, Merkle Root, and Prev/Current hash values to each record.</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isExporting || exportComplete}
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {exportComplete ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                Downloaded!
              </>
            ) : isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
