import React, { useState } from 'react';
import { USSD_CODES, DIAGNOSTIC_LIMITATIONS_EXPLANATION } from '../data/ussd-codes';
import { TelcoOperator } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  FileKey,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface KnowledgeHubProps {
  operators: TelcoOperator[];
}

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ operators }) => {
  const [showUssdExpl, setShowUssdExpl] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* GŁÓWNY ALERT ANTY-BLOKADOWY: ZASTRZEŻENIE PESEL W MOBYWATELU */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Krytyczna Procedura Anty-Fraudowa
              </span>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Zastrzeżenie Numeru PESEL w mObywatelu a Wizyta w Salonie
              </h3>
            </div>

            <p className="text-sm text-amber-200/90 leading-relaxed">
              Zgodnie z polskim prawem od 2024 roku wszyscy operatorzy telekomunikacyjni w Polsce mają <strong>ustawowy obowiązek</strong> weryfikacji państwowego rejestru Zastrzeżeń Numerów PESEL przed wydaniem duplikatu karty SIM lub wygenerowaniem profilu eSIM.
            </p>

            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Co to oznacza dla Ciebie w praktyce?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                <li>Jeżeli masz aktywną usługę "Zastrzeż PESEL" w aplikacji mObywatel, terminal pracownika salonu <strong>automatycznie i bezwzględnie zablokuje</strong> procedurę wydania duplikatu karty SIM!</li>
                <li>Przed podejściem do stanowiska obsługi w salonie wejdź w aplikację <strong>mObywatel</strong> i wybierz <strong>"Cofnij zastrzeżenie PESEL"</strong> (możesz ustawić automatyczne ponowne zastrzeżenie po np. 2 godzinach).</li>
                <li>Dopiero ze zwolnionym rekordem PESEL konsultant w salonie będzie mógł powiązać nową fizyczną kartę SIM (ICCID) z Twoim kontem abonenckim w centrali HLR.</li>
                <li>Operatorzy nie honorują pełnomocnictw notarialnych przy wymianie utraconych kart ze względów bezpieczeństwa (ataki SIM Swap) – wymagana jest osobista obecność z dowodem osobistym.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SEKCJA: ATUTY PRAWA RODO ART. 15 VS SYSTEMY TELEKOMÓW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <FileKey className="w-5 h-5" />
            <h4 className="font-bold text-white text-base">Dlaczego wniosek RODO Art. 15 działa?</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Konsultanci infolinii i salonów widzą tylko aktywną, pojedynczą kartotekę klienta powiązaną z danym systemem billingowym. W przypadku operatorów (np. Orange czy Play po fuzjach z UPC i Virgin) systemy są rozproszone na wiele baz.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div><strong>Wniosek do IOD trafia do komórki Compliance/Prawnej:</strong></div>
            <div>Oficer Ochrony Danych ma uprawnienia do kwerendy we wszystkich hurtowniach danych, archiwach retencyjnych i starych systemach billingowych operatora, co pozwala odnaleźć zapomniane numery testowe.</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Smartphone className="w-5 h-5" />
            <h4 className="font-bold text-white text-base">Cykle życia karty SIM i Kwarantanna</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
              <div><strong>Aktywny:</strong> 100% szans odzyskania. Natychmiastowe wydanie duplikatu w salonie po okazaniu dowodu.</div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0"></span>
              <div><strong>Kwarantanna (30-180 dni):</strong> Szansa warunkowa. Numer nie jest w obcych rękach, ale wymaga reklamacji w BOK lub podpisania umowy abonamentowej na ten MSISDN.</div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0"></span>
              <div><strong>Zrecyklingowany:</strong> 0% szans. Numer trafił z powrotem do ogólnej puli rynkowej lub nowego abonenta.</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA PROCEDUR I KOSZTÓW OPERATORÓW */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
          <span>Cennik i Wymogi Proceduralne Operatorów (Duplikaty SIM)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Oficjalne stawki i uwarunkowania wyrobienia nowej karty SIM po zagubieniu nośnika testowego:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Opłata za duplikat</th>
                <th className="px-4 py-3">Wymóg osobisty</th>
                <th className="px-4 py-3">Wysyłka kurierem</th>
                <th className="px-4 py-3">Szczegóły procedury</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {operators.map(op => (
                <tr key={op.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-semibold text-white">{op.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {op.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">{op.duplicateCost}</td>
                  <td className="px-4 py-3">
                    {op.authRequirements === 'SALON_STATIONARY' || op.category === 'MNO' ? (
                      <span className="text-amber-400 font-semibold">TAK (Salon)</span>
                    ) : (
                      <span className="text-slate-300">Zdalna weryfikacja</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {op.id === 't-mobile-pl' || op.category === 'MVNO' ? (
                      <span className="text-emerald-400">Dostępna</span>
                    ) : (
                      <span className="text-rose-400">Niedostępna</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{op.duplicateProcedure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABELA KODÓW USSD I DIAGNOSTYKI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Krótkie Kody Diagnostyczne USSD (Gdy Karta SIM Jest Fizycznie Dostępna)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Zestawienie komend USSD/IVR pozwalających na szybkie sprawdzenie numeru MSISDN bezpośrednio w telefonie.
            </p>
          </div>

          <button
            onClick={() => setShowUssdExpl(!showUssdExpl)}
            className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300"
          >
            <span>Dlaczego to nie wystarcza?</span>
            {showUssdExpl ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showUssdExpl && (
          <div className="mb-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-line animate-fade-in">
            {DIAGNOSTIC_LIMITATIONS_EXPLANATION}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {USSD_CODES.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{item.operator}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                  {item.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
