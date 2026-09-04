import React, { useState } from 'react';
import { DiscoveredNumber, SimStatus, TelcoOperator } from '../types';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  X,
  Smartphone,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface ResponseModalProps {
  isOpen: boolean;
  operator: TelcoOperator | null;
  onClose: () => void;
  onConfirmResponse: (
    operatorId: string,
    result: 'FOUND_NUMBERS' | 'NO_NUMBERS',
    numbers: DiscoveredNumber[],
    notes?: string
  ) => void;
}

interface NewNumberRow {
  id: string;
  msisdn: string;
  iccid: string;
  type: DiscoveredNumber['type'];
  status: SimStatus;
  notes: string;
}

export const ResponseModal: React.FC<ResponseModalProps> = ({
  isOpen,
  operator,
  onClose,
  onConfirmResponse
}) => {
  if (!isOpen || !operator) return null;

  const [resultType, setResultType] = useState<'FOUND_NUMBERS' | 'NO_NUMBERS'>('FOUND_NUMBERS');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [numberRows, setNumberRows] = useState<NewNumberRow[]>([
    {
      id: `row_${Date.now()}`,
      msisdn: '',
      iccid: '',
      type: 'PREPAID',
      status: 'ACTIVE',
      notes: ''
    }
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddRow = () => {
    setNumberRows(prev => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        msisdn: '',
        iccid: '',
        type: 'PREPAID',
        status: 'ACTIVE',
        notes: ''
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (numberRows.length === 1) {
      setNumberRows([
        {
          id: `row_${Date.now()}`,
          msisdn: '',
          iccid: '',
          type: 'PREPAID',
          status: 'ACTIVE',
          notes: ''
        }
      ]);
      return;
    }
    setNumberRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof NewNumberRow, val: any) => {
    setNumberRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleSave = () => {
    setValidationError(null);

    if (resultType === 'NO_NUMBERS') {
      onConfirmResponse(operator.id, 'NO_NUMBERS', [], generalNotes.trim() || 'Operator nie przetwarza numerów dla tego PESEL');
      onClose();
      return;
    }

    // Jeśli wybrano opcję "Znaleziono numery", musi być podany przynajmniej jeden niepusty numer MSISDN!
    const validRows = numberRows.filter(r => r.msisdn.trim().length > 0);
    if (validRows.length === 0) {
      setValidationError('Podaj przynajmniej jeden numer telefonu (MSISDN). Jeśli operator nie znalazł numerów, wybierz opcję "Brak zarejestrowanych numerów". Jeśli zamkniesz to okno, wniosek pozostanie w toku w SLA.');
      return;
    }

    const compiledNumbers: DiscoveredNumber[] = validRows.map(r => {
      let cost = operator.estimatedCostPln || 25;
      if (r.status === 'RECYCLED') cost = 0;

      return {
        id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        operatorId: operator.id,
        msisdn: r.msisdn.trim(),
        iccid: r.iccid.trim() || undefined,
        type: r.type,
        status: r.status,
        recoveryFeasible: r.status !== 'RECYCLED',
        estimatedCostPln: cost,
        notes: r.notes.trim() || undefined
      };
    });

    onConfirmResponse(operator.id, 'FOUND_NUMBERS', compiledNumbers, generalNotes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        
        {/* Nagłówek */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Rejestracja Odpowiedzi: {operator.name}</h3>
              <p className="text-xs text-slate-400">
                Wniosek pozostanie w trackingu SLA jako <span className="text-emerald-400 font-semibold">WYSŁANO</span>, dopóki nie zatwierdzisz wyniku.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Anuluj (Wniosek pozostanie w SLA)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs text-slate-300">
          
          {/* Wybór wyniku */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Jaki jest wynik odpowiedzi operatora na wniosek RODO?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResultType('FOUND_NUMBERS')}
                className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition ${
                  resultType === 'FOUND_NUMBERS'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${resultType === 'FOUND_NUMBERS' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-white text-xs">Znaleziono numery (Wynik pozytywny)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Operator przekazał zestawienie numerów MSISDN/kart SIM zarejestrowanych na Twój PESEL.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResultType('NO_NUMBERS')}
                className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition ${
                  resultType === 'NO_NUMBERS'
                    ? 'bg-blue-950/60 border-blue-500/60 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <XCircle className={`w-5 h-5 mt-0.5 shrink-0 ${resultType === 'NO_NUMBERS' ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-white text-xs">Brak numerów (Wynik negatywny)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Operator oświadczył, że nie figurujesz w bazach lub historia została usunięta.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Formularz wprowadzania numerów jeśli znaleziono */}
          {resultType === 'FOUND_NUMBERS' ? (
            <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Wprowadź numery przekazane przez operatora:</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kolejny numer</span>
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {numberRows.map((row, index) => (
                  <div key={row.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">Numer #{index + 1}</span>
                      {numberRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">MSISDN (Numer telefonu) *</label>
                        <input
                          type="text"
                          required
                          value={row.msisdn}
                          onChange={e => handleUpdateRow(row.id, 'msisdn', e.target.value)}
                          placeholder="np. +48 600 000 000"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">ICCID (opcjonalny)</label>
                        <input
                          type="text"
                          value={row.iccid}
                          onChange={e => handleUpdateRow(row.id, 'iccid', e.target.value)}
                          placeholder="np. 8948..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Typ usługi</label>
                        <select
                          value={row.type}
                          onChange={e => handleUpdateRow(row.id, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                        >
                          <option value="PREPAID">Na kartę (Prepaid)</option>
                          <option value="POSTPAID">Abonament (Postpaid)</option>
                          <option value="DATA_ONLY">Internet mobilny (Data)</option>
                          <option value="INACTIVE_QUARANTINE">Wygaszona / Kwarantanna</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Status techniczny</label>
                        <select
                          value={row.status}
                          onChange={e => handleUpdateRow(row.id, 'status', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                        >
                          <option value="ACTIVE">Aktywny (100% szans odzyskania)</option>
                          <option value="PASSIVE">Pasywny (blokada wychodzących)</option>
                          <option value="QUARANTINED">Kwarantanna (30-180 dni)</option>
                          <option value="RECYCLED">Zrecyklingowany (0% szans)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-300">
                Operator oświadczył, że nie figurujesz w jego rejestrach abonentów ani bazach retencyjnych.
              </div>
              <div className="text-[11px] text-slate-400">
                Wniosek zostanie oznaczony jako sfinalizowany z wynikiem: <strong className="text-blue-400">Brak zarejestrowanych numerów</strong>.
              </div>
            </div>
          )}

          {/* Opcjonalne notatki ogólne */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Notatka lub sygnatura pisma operatora (opcjonalna):</label>
            <input
              type="text"
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              placeholder="np. Pismo IOD/2026/8912 z dnia dzisiejszego"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
            />
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Przyciski w stopce modala */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Anuluj (Wniosek pozostaje w toku SLA)
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Zatwierdź odpowiedź i zakończ SLA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
