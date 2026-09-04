import React, { useState } from 'react';
import { DiscoveredNumber, SimStatus, TelcoOperator } from '../types';
import {
  Smartphone,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Coins,
  Download
} from 'lucide-react';

interface InventoryTableProps {
  numbers: DiscoveredNumber[];
  operators: TelcoOperator[];
  onAddNumber: (num: DiscoveredNumber) => void;
  onDeleteNumber: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  numbers,
  operators,
  onAddNumber,
  onDeleteNumber
}) => {
  const [operatorId, setOperatorId] = useState<string>(operators[0]?.id || '');
  const [msisdn, setMsisdn] = useState<string>('');
  const [iccid, setIccid] = useState<string>('');
  const [type, setType] = useState<DiscoveredNumber['type']>('PREPAID');
  const [status, setStatus] = useState<SimStatus>('ACTIVE');
  const [notes, setNotes] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const getOperator = (id: string) => operators.find(o => o.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msisdn.trim()) return;

    const op = getOperator(operatorId);
    let cost = op?.estimatedCostPln || 25;
    if (status === 'RECYCLED') cost = 0; // nie do odzyskania

    const newNum: DiscoveredNumber = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      operatorId,
      msisdn: msisdn.trim(),
      iccid: iccid.trim() || undefined,
      type,
      status,
      recoveryFeasible: status !== 'RECYCLED',
      estimatedCostPln: cost,
      notes: notes.trim() || undefined
    };

    onAddNumber(newNum);
    setMsisdn('');
    setIccid('');
    setNotes('');
    setIsAdding(false);
  };

  // Podsumowanie kosztów i statystyk
  const totalCost = numbers.reduce((acc, curr) => acc + (curr.recoveryFeasible ? curr.estimatedCostPln : 0), 0);
  const activeCount = numbers.filter(n => n.status === 'ACTIVE').length;
  const quarantineCount = numbers.filter(n => n.status === 'QUARANTINED').length;
  const recycledCount = numbers.filter(n => n.status === 'RECYCLED').length;

  const exportCsv = () => {
    const headers = ['Operator', 'MSISDN', 'ICCID', 'Typ', 'Status', 'Mozliwosc Odzyskania', 'Szacowany Koszt (PLN)', 'Notatki'];
    const rows = numbers.map(n => {
      const op = getOperator(n.operatorId);
      return [
        `"${op?.name || n.operatorId}"`,
        `"${n.msisdn}"`,
        `"${n.iccid || ''}"`,
        `"${n.type}"`,
        `"${n.status}"`,
        `"${n.recoveryFeasible ? 'TAK' : 'NIE'}"`,
        `"${n.estimatedCostPln}"`,
        `"${n.notes || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ewidencja_kart_sim_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek i Statystyki portfela */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              <span>Ewidencja Zidentyfikowanych Numerów MSISDN</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Rejestr numerów telefonów odkrytych w odpowiedziach RODO od operatorów wraz z analizą szansy i kosztu ich odzyskania.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj zidentyfikowany numer</span>
            </button>

            {numbers.length > 0 && (
              <button
                onClick={exportCsv}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Karty podsumowujące budżet i statusy */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Szacowany budżet:</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {totalCost.toFixed(2)} <span className="text-xs text-slate-400 font-normal">PLN</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aktywne (100% szans):</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{activeCount}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Kwarantanna (30-180 dni):</span>
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{quarantineCount}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Zrecyklingowane (0%):</span>
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1">{recycledCount}</div>
          </div>
        </div>
      </div>

      {/* Formularz dodawania numeru */}
      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-4">Wprowadź numer uzyskany od operatora:</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operator *</label>
              <select
                value={operatorId}
                onChange={e => setOperatorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
              >
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Numer telefonu (MSISDN) *</label>
              <input
                type="text"
                required
                value={msisdn}
                onChange={e => setMsisdn(e.target.value)}
                placeholder="np. +48 600 000 000"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Numer karty (ICCID)</label>
              <input
                type="text"
                value={iccid}
                onChange={e => setIccid(e.target.value)}
                placeholder="np. 8948..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Typ usługi</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
              >
                <option value="PREPAID">Na kartę (Prepaid)</option>
                <option value="POSTPAID">Abonament (Postpaid)</option>
                <option value="DATA_ONLY">Tylko dane (Internet mobilny)</option>
                <option value="INACTIVE_QUARANTINE">Wygaszona / Kwarantanna</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status techniczny</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
              >
                <option value="ACTIVE">Aktywny (utracony nośnik SIM - 100% szans)</option>
                <option value="PASSIVE">Pasywny (blokada wychodzących - &gt;90% szans)</option>
                <option value="QUARANTINED">Kwarantanna (30-180 dni - szansa warunkowa)</option>
                <option value="RECYCLED">Zrecyklingowany (0% - numer w puli obcej)</option>
                <option value="UNKNOWN">Nieznany status</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notatka</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="np. Karta do testów Samsunga S23"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3 flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                Zapisz numer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela numerów */}
      {numbers.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Brak zarejestrowanych numerów w ewidencji</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Gdy operatorzy prześlą odpowiedzi na Twoje wnioski RODO, dodaj odkryte numery tutaj, aby zaplanować ich odzyskanie w salonach i oszacować budżet.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">MSISDN (Numer)</th>
                  <th className="px-4 py-3">ICCID</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Status i Szansa</th>
                  <th className="px-4 py-3">Koszt duplikatu</th>
                  <th className="px-4 py-3">Procedura odzyskania</th>
                  <th className="px-4 py-3 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {numbers.map(num => {
                  const op = getOperator(num.operatorId);
                  return (
                    <tr key={num.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-semibold text-white">
                        {op?.name || num.operatorId}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400 select-all">
                        {num.msisdn}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {num.iccid || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {num.type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            num.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : num.status === 'PASSIVE'
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                              : num.status === 'QUARANTINED'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {num.status} ({num.recoveryFeasible ? 'Odzyskiwalny' : 'Utracony'})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {num.recoveryFeasible ? `${num.estimatedCostPln.toFixed(2)} PLN` : '0.00 PLN'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={op?.duplicateProcedure}>
                        {op?.duplicateProcedure || 'Wizyta w salonie'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onDeleteNumber(num.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Usuń numer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
