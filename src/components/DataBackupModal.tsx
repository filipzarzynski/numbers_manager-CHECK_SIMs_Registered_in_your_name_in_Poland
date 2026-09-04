import React, { useRef, useState } from 'react';
import { exportBackupJson, importBackupJson, clearAllLocalData } from '../lib/storage';
import { HardDriveDownload, HardDriveUpload, Trash2, X, Check, AlertTriangle } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataReload
}) => {
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telcoaudit_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const ok = importBackupJson(content);
      if (ok) {
        setImportSuccess(true);
        setImportError(null);
        onDataReload();
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 1500);
      } else {
        setImportError('Plik JSON jest uszkodzony lub ma nieprawidłowy format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie dane z pamięci lokalnej przeglądarki?')) {
      clearAllLocalData();
      onDataReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-bold text-lg text-white flex items-center space-x-2">
            <HardDriveDownload className="w-5 h-5 text-emerald-400" />
            <span>Kopia Zapasowa Danych (JSON)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-300">
          <p>
            Wszystkie Twoje dane (PESEL, dowód, historia wysłanych wniosków i odkryte numery) są przechowywane wyłącznie w pamięci podręcznej tej przeglądarki (Zero-Knowledge).
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200">Eksportuj stan aplikacji do pliku:</div>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Pobierz plik kopii (JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200">Przywróć stan z pliku JSON:</div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
            >
              <HardDriveUpload className="w-4 h-4 text-teal-400" />
              <span>Wybierz plik kopii zapasowej</span>
            </button>
          </div>

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Dane zostały pomyślnie wczytane!</span>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{importError}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Wyczyść całą lokalną pamięć podręczną</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
