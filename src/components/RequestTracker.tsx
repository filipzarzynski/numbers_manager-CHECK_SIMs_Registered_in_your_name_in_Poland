import React, { useState } from 'react';
import { AuditRequest, RequestStatus, TelcoOperator, UserProfile } from '../types';
import { calculateSlaDeadline, generatePreLitigationNotice } from '../lib/date-utils';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Copy,
  Check,
  Send,
  Calendar,
  X
} from 'lucide-react';

interface RequestTrackerProps {
  requests: AuditRequest[];
  operators: TelcoOperator[];
  profile: UserProfile;
  onUpdateStatus: (operatorId: string, status: RequestStatus) => void;
  onOpenResponseModal: (operator: TelcoOperator) => void;
  onResetToSla: (operatorId: string) => void;
  onNavigateToInventory: () => void;
}

export const RequestTracker: React.FC<RequestTrackerProps> = ({
  requests,
  operators,
  profile,
  onUpdateStatus,
  onOpenResponseModal,
  onResetToSla,
  onNavigateToInventory
}) => {
  const [selectedNoticeOp, setSelectedNoticeOp] = useState<TelcoOperator | null>(null);
  const [noticeText, setNoticeText] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const getOperator = (opId: string) => operators.find(o => o.id === opId);

  const activeRequests = requests.filter(r => r.status === 'SENT' || r.status === 'AWAITING_REPLY');
  const repliedRequests = requests.filter(r => r.status === 'REPLIED' || r.status === 'CLOSED');

  const handleOpenNotice = (op: TelcoOperator, sentAt?: string) => {
    setSelectedNoticeOp(op);
    const text = generatePreLitigationNotice(profile, op, sentAt || new Date().toISOString());
    setNoticeText(text);
  };

  const handleCopyNotice = async () => {
    await navigator.clipboard.writeText(noticeText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek sekcji SLA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Monitoring Ustawowego Terminu 30 Dni (Art. 12 ust. 3 RODO)</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Zgodnie z prawem unijnym operator telekomunikacyjny ma bezwzględny obowiązek udzielenia odpowiedzi i przekazania kopii danych w ciągu 30 dni od wpływu wniosku.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Aktywne kwerendy</div>
              <div className="text-lg font-bold text-emerald-400">{activeRequests.length}</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Zrealizowane</div>
              <div className="text-lg font-bold text-teal-400">{repliedRequests.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista aktywnych wniosków z licznikiem SLA */}
      {activeRequests.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Brak aktywnych wniosków w toku SLA</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Przejdź do zakładki "Wnioskomat RODO", pobierz wnioski lub wyślij je do operatorów, a następnie oznacz jako "Wysłane", aby uruchomić automatyczne odliczanie 30 dni.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRequests.map(req => {
            const op = getOperator(req.operatorId);
            if (!op) return null;

            const sentAt = req.sentAt || req.createdAt;
            const sla = calculateSlaDeadline(sentAt);

            return (
              <div
                key={req.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition ${
                  sla.isOverdue
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : sla.daysRemaining <= 5
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{op.name}</h4>
                      <p className="text-xs text-slate-400">{op.legalEntity}</p>
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                        sla.isOverdue
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : sla.daysRemaining <= 5
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {sla.isOverdue
                        ? `Przeterminowane (${Math.abs(sla.daysRemaining)} dni)`
                        : `Pozostało: ${sla.daysRemaining} dni`}
                    </span>
                  </div>

                  {/* Informacja o dacie wysłania i deadline */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Send className="w-3 h-3 text-slate-400" />
                        <span>Data wysłania:</span>
                      </span>
                      <span className="text-slate-200 font-mono">{sentAt.split('T')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Termin ustawowy:</span>
                      </span>
                      <span className={`font-mono font-semibold ${sla.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {sla.deadlineDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Kanał doręczenia:</span>
                      <span className="font-semibold text-cyan-400">
                        {req.channel === 'EDORECZENIA' ? 'e-Doręczenia ADE' : 'E-mail IOD'}
                      </span>
                    </div>
                  </div>

                  {/* Alert opóźnienia */}
                  {sla.isOverdue && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Naruszenie art. 12 ust. 3 RODO!</div>
                        <div>Operator przekroczył termin. Przysługuje Ci prawo do skargi do UODO.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Przyciski akcji */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => onOpenResponseModal(op)}
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zarejestruj odpowiedź operatora</span>
                  </button>

                  {sla.isOverdue && (
                    <button
                      type="button"
                      onClick={() => handleOpenNotice(op, req.sentAt)}
                      className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-700/80 transition"
                    >
                      <FileWarning className="w-3.5 h-3.5 text-rose-400" />
                      <span>Generuj Monit Przedsądowy (UODO)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sekcja zakończonych kwerend z opcją wznawiania w SLA */}
      {repliedRequests.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Zarejestrowane Odpowiedzi Operatorów ({repliedRequests.length})
              </h3>
              <p className="text-xs text-slate-400">
                Możesz w każdej chwili zedytować wynik lub wznowić wniosek w SLA od nowa.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToInventory}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline"
            >
              Przejdź do ewidencji numerów &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repliedRequests.map(req => {
              const op = getOperator(req.operatorId);
              if (!op) return null;

              return (
                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{op.name}</h4>
                        <p className="text-[11px] text-slate-400">{op.legalEntity}</p>
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                          req.result === 'FOUND_NUMBERS'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : req.result === 'NO_NUMBERS'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        }`}
                      >
                        {req.result === 'FOUND_NUMBERS'
                          ? 'Znaleziono numery'
                          : req.result === 'NO_NUMBERS'
                          ? 'Brak numerów'
                          : 'Odpowiedź'}
                      </span>
                    </div>

                    {req.notes && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                        {req.notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onOpenResponseModal(op)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition text-center"
                    >
                      Edytuj wynik
                    </button>

                    <button
                      type="button"
                      onClick={() => onResetToSla(op.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition text-center"
                      title="Wznów w SLA i uruchom ponownie licznik 30 dni"
                    >
                      Wznów w SLA
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal z Wezwaniem Przedsądowym */}
      {selectedNoticeOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400">
                <FileWarning className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">
                  Ostateczne Przedsądowe Wezwanie do Usunięcia Naruszenia
                </h3>
              </div>
              <button
                onClick={() => setSelectedNoticeOp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-2">
                Poniższa treść stanowi formalne ponaglenie przed złożeniem zawiadomienia do Prezesa Urzędu Ochrony Danych Osobowych o naruszeniu przepisów RODO:
              </p>
              <textarea
                readOnly
                rows={12}
                value={noticeText}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">Adresat: {selectedNoticeOp.dpoEmail}</span>
              <button
                onClick={handleCopyNotice}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNotice ? 'Skopiowano!' : 'Kopiuj treść wezwania'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
