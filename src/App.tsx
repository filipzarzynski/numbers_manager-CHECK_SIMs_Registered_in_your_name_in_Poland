import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProfileForm } from './components/ProfileForm';
import { OperatorCard } from './components/OperatorCard';
import { RequestTracker } from './components/RequestTracker';
import { InventoryTable } from './components/InventoryTable';
import { KnowledgeHub } from './components/KnowledgeHub';
import { DataBackupModal } from './components/DataBackupModal';
import { ResponseModal } from './components/ResponseModal';
import { POLISH_OPERATORS } from './data/operators';
import {
  AuditRequest,
  DeliveryChannel,
  DiscoveredNumber,
  RequestStatus,
  TelcoOperator,
  UserProfile
} from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadAuditRequests,
  saveAuditRequests,
  loadDiscoveredNumbers,
  saveDiscoveredNumbers,
  DEFAULT_TEST_PROFILE,
  EMPTY_PROFILE
} from './lib/storage';
import { Search, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile() || EMPTY_PROFILE);
  const [requests, setRequests] = useState<AuditRequest[]>(() => loadAuditRequests());
  const [numbers, setNumbers] = useState<DiscoveredNumber[]>(() => loadDiscoveredNumbers());
  const [activeTab, setActiveTab] = useState<'generator' | 'tracker' | 'inventory' | 'knowledge'>('generator');
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [responseModalOp, setResponseModalOp] = useState<TelcoOperator | null>(null);

  // Filtry w Wnioskomacie
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MNO' | 'MVNO'>('ALL');

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveAuditRequests(requests);
  }, [requests]);

  useEffect(() => {
    saveDiscoveredNumbers(numbers);
  }, [numbers]);

  const handleUpdateStatus = (operatorId: string, status: RequestStatus, channel: DeliveryChannel = 'EMAIL') => {
    setRequests(prev => {
      const existingIdx = prev.findIndex(r => r.operatorId === operatorId);
      const now = new Date().toISOString();
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          channel,
          sentAt: status === 'SENT' ? (updated[existingIdx].sentAt || now) : updated[existingIdx].sentAt
        };
        return updated;
      } else {
        const newReq: AuditRequest = {
          id: `req_${Date.now()}_${operatorId}`,
          operatorId,
          channel,
          createdAt: now,
          sentAt: status === 'SENT' ? now : undefined,
          status,
          identifiedNumbers: []
        };
        return [...prev, newReq];
      }
    });
  };

  const handleConfirmResponse = (
    operatorId: string,
    result: 'FOUND_NUMBERS' | 'NO_NUMBERS',
    newNumbers: DiscoveredNumber[],
    notes?: string
  ) => {
    setRequests(prev => {
      const existingIdx = prev.findIndex(r => r.operatorId === operatorId);
      const now = new Date().toISOString();
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: 'REPLIED',
          result,
          notes: notes || updated[existingIdx].notes,
          identifiedNumbers: newNumbers
        };
        return updated;
      } else {
        const newReq: AuditRequest = {
          id: `req_${Date.now()}_${operatorId}`,
          operatorId,
          channel: 'EMAIL',
          createdAt: now,
          status: 'REPLIED',
          result,
          notes,
          identifiedNumbers: newNumbers
        };
        return [...prev, newReq];
      }
    });

    if (newNumbers.length > 0) {
      setNumbers(prev => [...newNumbers, ...prev]);
    }
  };

  const handleResetToSla = (operatorId: string) => {
    setRequests(prev => {
      const existingIdx = prev.findIndex(r => r.operatorId === operatorId);
      const now = new Date().toISOString();
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: 'SENT',
          sentAt: now,
          result: 'PENDING'
        };
        return updated;
      } else {
        const newReq: AuditRequest = {
          id: `req_${Date.now()}_${operatorId}`,
          operatorId,
          channel: 'EMAIL',
          createdAt: now,
          sentAt: now,
          status: 'SENT',
          result: 'PENDING',
          identifiedNumbers: []
        };
        return [...prev, newReq];
      }
    });
  };

  const handleAddNumber = (newNum: DiscoveredNumber) => {
    setNumbers(prev => [newNum, ...prev]);
  };

  const handleDeleteNumber = (id: string) => {
    setNumbers(prev => prev.filter(n => n.id !== id));
  };

  const handleReloadData = () => {
    setProfile(loadUserProfile() || EMPTY_PROFILE);
    setRequests(loadAuditRequests());
    setNumbers(loadDiscoveredNumbers());
  };

  const filteredOperators = POLISH_OPERATORS.filter(op => {
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.tradeBrands.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
      op.legalEntity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || op.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const sentCount = requests.filter(r => r.status === 'SENT' || r.status === 'AWAITING_REPLY').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackup={() => setIsBackupOpen(true)}
        sentCount={sentCount}
        discoveredCount={numbers.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ZAKŁADKA 1: WNIOSKOMAT RODO */}
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Formularz profilu */}
            <ProfileForm profile={profile} onSaveProfile={setProfile} />

            {/* Wyszukiwarka i filtry operatorów */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Katalog Operatorów Telekomunikacyjnych ({POLISH_OPERATORS.length} podmiotów)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Wybierz operatorów i pobierz gotowe pisma PDF, pliki .EML lub wyślij pismo przez e-Doręczenia.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Wyszukiwarka */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Szukaj sieci lub marki..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none w-48 sm:w-64"
                    />
                  </div>

                  {/* Filtr kategorii */}
                  <div className="flex rounded-xl bg-slate-950 p-0.5 border border-slate-800">
                    {(['ALL', 'MNO', 'MVNO'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                          categoryFilter === cat
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat === 'ALL' ? 'Wszystkie' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Siatka kart operatorów */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {filteredOperators.map(op => {
                  const req = requests.find(r => r.operatorId === op.id);
                  return (
                    <OperatorCard
                      key={op.id}
                      operator={op}
                      profile={profile}
                      currentRequest={req}
                      onUpdateStatus={handleUpdateStatus}
                      onOpenResponseModal={setResponseModalOp}
                      onResetToSla={handleResetToSla}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: MONITORING SLA (30 DNI) */}
        {activeTab === 'tracker' && (
          <RequestTracker
            requests={requests}
            operators={POLISH_OPERATORS}
            profile={profile}
            onUpdateStatus={handleUpdateStatus}
            onOpenResponseModal={setResponseModalOp}
            onResetToSla={handleResetToSla}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {/* ZAKŁADKA 3: EWIDENCJA NUMERÓW MSISDN */}
        {activeTab === 'inventory' && (
          <InventoryTable
            numbers={numbers}
            operators={POLISH_OPERATORS}
            onAddNumber={handleAddNumber}
            onDeleteNumber={handleDeleteNumber}
          />
        )}

        {/* ZAKŁADKA 4: BAZA WIEDZY & ODZYSKIWANIE */}
        {activeTab === 'knowledge' && (
          <KnowledgeHub operators={POLISH_OPERATORS} />
        )}
      </main>

      {/* Stopka */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>TelcoAudit Pro — System Audytu Właścicielskiego Kart SIM & Agregacji RODO Art. 15</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Wszystkie procesy szyfrowane i uruchamiane 100% po stronie przeglądarki (Local-First).</span>
          </div>
        </div>
      </footer>

      {/* Modal Kopia Zapasowa */}
      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReload={handleReloadData}
      />

      {/* Modal Rejestracji Odpowiedzi Operatora */}
      <ResponseModal
        isOpen={!!responseModalOp}
        operator={responseModalOp}
        onClose={() => setResponseModalOp(null)}
        onConfirmResponse={handleConfirmResponse}
      />
    </div>
  );
};
