import { useState, useRef } from 'react';
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Download, Database, Server, Check, Sparkles 
} from 'lucide-react';
import { generateDid, type Identity, type SecurityClearance, type IdentityStatus } from '../services/identities';

interface ImportIdentitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportIdentities: (newIdentities: Identity[]) => void;
}

const LDAP_PRESET_BATCH: Partial<Identity>[] = [
  {
    name: 'Commodore S. V. Nair',
    employeeId: 'BEL-NAV-0189',
    email: 'sv.nair@bel.co.in',
    role: 'Manager',
    department: 'Radar Systems',
    status: 'Verified' as IdentityStatus,
    securityClearance: 'Top Secret (SCI)' as SecurityClearance,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Sunita Deshmukh',
    employeeId: 'BEL-RD-0732',
    email: 'sunita.d@bel.co.in',
    role: 'Engineer',
    department: 'R&D Avionics',
    status: 'Verified' as IdentityStatus,
    securityClearance: 'Secret' as SecurityClearance,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    name: 'Major Alok Verma',
    employeeId: 'BEL-DEF-0911',
    email: 'alok.verma@bel.co.in',
    role: 'Security Officer',
    department: 'Strategic Defence',
    status: 'Verified' as IdentityStatus,
    securityClearance: 'Top Secret (SCI)' as SecurityClearance,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    name: 'Kavita Menon',
    employeeId: 'BEL-AUD-0419',
    email: 'kavita.menon@bel.co.in',
    role: 'Auditor',
    department: 'Audit & Compliance',
    status: 'Pending' as IdentityStatus,
    securityClearance: 'Secret' as SecurityClearance,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
];

export default function ImportIdentitiesModal({
  isOpen,
  onClose,
  onImportIdentities,
}: ImportIdentitiesModalProps) {
  const [activeSource, setActiveSource] = useState<'ldap' | 'file' | 'json'>('ldap');
  const [parsedIdentities, setParsedIdentities] = useState<Identity[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [jsonInput, setJsonInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(parsedIdentities.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleLoadLdapPreset = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      const generated: Identity[] = LDAP_PRESET_BATCH.map((item, idx) => {
        const id = `bel-imp-${Date.now()}-${idx}`;
        const wallet = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const pubKey = '0x04' + Array.from({ length: 42 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        return {
          id,
          name: item.name || 'Defense Personnel',
          did: generateDid(),
          employeeId: item.employeeId || `BEL-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          email: item.email || 'user@bel.co.in',
          role: item.role || 'User',
          department: item.department || 'Operations',
          status: item.status || 'Verified',
          securityClearance: item.securityClearance || 'Secret',
          walletAddress: wallet,
          publicKey: pubKey,
          keyType: 'Ed25519',
          avatar: item.avatar,
          createdOn: new Date().toISOString().split('T')[0],
          lastActive: 'Just synced',
          verifiableCredentialsCount: 4,
        };
      });

      setParsedIdentities(generated);
      setSelectedIds(new Set(generated.map((g) => g.id)));
      setIsProcessing(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          processJsonArray(parsed);
        } else if (file.name.endsWith('.csv')) {
          processCsvText(content);
        } else {
          setErrorMessage('Please upload a valid .json or .csv file');
        }
      } catch (err: any) {
        setErrorMessage(`Failed to parse file: ${err.message}`);
      }
    };

    reader.readAsText(file);
  };

  const processJsonArray = (items: any[]) => {
    if (!Array.isArray(items)) {
      setErrorMessage('JSON must be an array of identity objects');
      return;
    }

    const formatted: Identity[] = items.map((item, idx) => ({
      id: item.id || `bel-imp-${Date.now()}-${idx}`,
      name: item.name || 'Imported User',
      did: item.did || generateDid(),
      employeeId: item.employeeId || `BEL-${Math.floor(1000 + Math.random() * 9000)}`,
      email: item.email || 'imported.user@bel.co.in',
      role: item.role || 'User',
      department: item.department || 'Operations',
      status: (item.status === 'Verified' || item.status === 'Pending' || item.status === 'Revoked') ? item.status : 'Verified',
      securityClearance: item.securityClearance || 'Secret',
      walletAddress: item.walletAddress || '0x' + Array.from({ length: 40 }, () => 'a').join(''),
      publicKey: item.publicKey || '0x04' + Array.from({ length: 40 }, () => 'b').join(''),
      keyType: item.keyType || 'Ed25519',
      avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdOn: item.createdOn || new Date().toISOString().split('T')[0],
      lastActive: 'Imported',
      verifiableCredentialsCount: item.verifiableCredentialsCount || 2,
    }));

    setParsedIdentities(formatted);
    setSelectedIds(new Set(formatted.map((f) => f.id)));
  };

  const processCsvText = (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrorMessage('CSV file must have headers and at least 1 record');
      return;
    }

    const records: Identity[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        records.push({
          id: `bel-csv-${Date.now()}-${i}`,
          name: parts[0] || 'Imported Person',
          did: generateDid(),
          employeeId: parts[1] || `BEL-${Math.floor(1000 + Math.random() * 9000)}`,
          email: parts[2] || `${parts[0]?.toLowerCase().replace(/\s+/g, '.')}@bel.co.in`,
          role: parts[3] || 'User',
          department: parts[4] || 'Operations',
          status: 'Verified',
          securityClearance: (parts[5] as SecurityClearance) || 'Secret',
          walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          publicKey: '0x04' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          keyType: 'Ed25519',
          createdOn: new Date().toISOString().split('T')[0],
          lastActive: 'Imported from CSV',
          verifiableCredentialsCount: 3,
        });
      }
    }

    setParsedIdentities(records);
    setSelectedIds(new Set(records.map((r) => r.id)));
  };

  const handleDownloadSample = () => {
    const sample = [
      {
        name: "Dr. K. S. Radhakrishnan",
        employeeId: "BEL-RD-0991",
        email: "radhakrishnan@bel.co.in",
        role: "Engineer",
        department: "R&D Avionics",
        securityClearance: "Top Secret (SCI)",
        status: "Verified"
      },
      {
        name: "Anil Deshmukh",
        employeeId: "BEL-SEC-0128",
        email: "anil.d@bel.co.in",
        role: "Security Officer",
        department: "IT Security",
        securityClearance: "Secret",
        status: "Verified"
      }
    ];

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "BEL_Identities_Sample_Template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmImport = () => {
    const toImport = parsedIdentities.filter((p) => selectedIds.has(p.id));
    if (toImport.length === 0) return;

    onImportIdentities(toImport);
    setSuccessCount(toImport.length);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import Decentralized Identities (DIDs)
              </h2>
              <p className="text-xs text-slate-500">
                Sync with BEL Defense Active Directory, LDAP, or upload structured JSON/CSV records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Selector Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/30 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveSource('ldap')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSource === 'ldap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            BEL LDAP / Active Directory Sync
          </button>
          <button
            onClick={() => setActiveSource('file')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSource === 'file'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Upload File (JSON / CSV)
          </button>
          <button
            onClick={() => setActiveSource('json')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSource === 'json'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Paste JSON Payload
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {successCount !== null ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {successCount} Identities Imported Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cryptographic DIDs and on-chain verifiable credentials registered.
              </p>
            </div>
          ) : (
            <>
              {/* Active Tab Content */}
              {activeSource === 'ldap' && (
                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        BEL Central Directory (ldap://directory.bel.co.in)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Ready to fetch defense personnel from Bengaluru, Hyderabad, and Kotdwara units.
                    </p>
                  </div>
                  <button
                    onClick={handleLoadLdapPreset}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting LDAP...
                      </>
                    ) : (
                      <>
                        <Server className="w-3.5 h-3.5" />
                        Fetch Directory Batch
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeSource === 'file' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                  >
                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose or drag & drop .json or .csv file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports standard BEL Identity schema and DID export arrays
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Need a starting structure?</span>
                    <button
                      onClick={handleDownloadSample}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Sample JSON Template
                    </button>
                  </div>
                </div>
              )}

              {activeSource === 'json' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Paste JSON Array</label>
                  <textarea
                    rows={5}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[ { "name": "Rajesh Sharma", "employeeId": "BEL-IT-099", "role": "Engineer", "department": "R&D" } ]'
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(jsonInput);
                        processJsonArray(parsed);
                        setErrorMessage(null);
                      } catch (e: any) {
                        setErrorMessage('Invalid JSON syntax: ' + e.message);
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Parse JSON Payload
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Preview of Parsed Identities */}
              {parsedIdentities.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Parsed Records ({parsedIdentities.length})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({selectedIds.size} selected)
                      </span>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === parsedIdentities.length && parsedIdentities.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      Select All
                    </label>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-8"></th>
                          <th className="px-3 py-2">Personnel</th>
                          <th className="px-3 py-2">Employee ID</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">Security Clearance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedIdentities.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelectOne(item.id)}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-900">{item.name}</td>
                            <td className="px-3 py-2 font-mono text-slate-500">{item.employeeId}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {item.role}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{item.department}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {item.securityClearance}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {parsedIdentities.length > 0
              ? `${selectedIds.size} of ${parsedIdentities.length} ready to import`
              : 'Select a data source to begin'}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={selectedIds.size === 0 || successCount !== null}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} Identities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
