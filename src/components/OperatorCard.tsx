import React, { useState } from 'react';
import { AuditRequest, DeliveryChannel, RequestStatus, TelcoOperator, UserProfile } from '../types';
import { generatePdfBrief } from '../lib/pdf-generator';
import { buildEmlMessage, buildMailtoUri } from '../lib/eml-builder';
import { buildEdoreczeniaContent } from '../lib/edoreczenia-builder';
import {
  FileDown,
  Mail,
  Copy,
  ExternalLink,
  Check,
  Send,
  Building2,
  Clock
} from 'lucide-react';

interface OperatorCardProps {
  operator: TelcoOperator;
  profile: UserProfile;
  currentRequest?: AuditRequest;
  onUpdateStatus: (operatorId: string, status: RequestStatus, channel: DeliveryChannel) => void;
  onOpenResponseModal: (operator: TelcoOperator) => void;
  onResetToSla: (operatorId: string) => void;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({
  operator,
  profile,
  currentRequest,
  onUpdateStatus,
  onOpenResponseModal,
  onResetToSla
}) => {
  const [channel, setChannel] = useState<DeliveryChannel>(currentRequest?.channel || 'EMAIL');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const status = currentRequest?.status || 'DRAFT';
  const result = currentRequest?.result;

  // Pobieranie PDF
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdfBytes = await generatePdfBrief(profile, operator);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wniosek_rodo_${operator.id}_${profile.pesel}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (status === 'DRAFT') {
        onUpdateStatus(operator.id, 'GENERATED', channel);
      }
    } catch (e) {
      console.error('Błąd generowania PDF:', e);
      alert('Wystąpił błąd podczas kompilacji pliku PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Pobieranie .eml RFC 822
  const handleDownloadEml = () => {
    try {
      const { raw, filename } = buildEmlMessage(profile, operator);
      const blob = new Blob([raw], { type: 'message/rfc822;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (status === 'DRAFT') {
        onUpdateStatus(operator.id, 'GENERATED', channel);
      }
    } catch (e) {
      console.error('Błąd generowania EML:', e);
    }
  };

  // Kopiowanie treści do e-Doręczeń
  const handleCopyEdoreczenia = async () => {
    const bundle = buildEdoreczeniaContent(profile, operator);
    await navigator.clipboard.writeText(bundle.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (status === 'DRAFT') {
      onUpdateStatus(operator.id, 'GENERATED', channel);
    }
  };

  const handleMarkAsSent = () => {
    onUpdateStatus(operator.id, 'SENT', channel);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
      <div>
        {/* Nagłówek karty */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base">{operator.name}</span>
              <span
                className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold border ${
                  operator.category === 'MNO'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                }`}
              >
                {operator.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{operator.legalEntity}</p>
          </div>

          {/* Status Badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
              status === 'SENT'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : status === 'GENERATED'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : status === 'REPLIED' && result === 'FOUND_NUMBERS'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : status === 'REPLIED' && result === 'NO_NUMBERS'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : status === 'REPLIED'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {status === 'DRAFT' && 'Szkic'}
            {status === 'GENERATED' && 'Wygenerowano'}
            {status === 'SENT' && 'Wysłano (SLA Aktywne)'}
            {status === 'REPLIED' && result === 'FOUND_NUMBERS' && 'Odpowiedź: Znaleziono numery'}
            {status === 'REPLIED' && result === 'NO_NUMBERS' && 'Odpowiedź: Brak numerów'}
            {status === 'REPLIED' && !result && 'Odpowiedź'}
          </span>
        </div>

        {/* Marki handlowe */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {operator.tradeBrands.map(brand => (
            <span
              key={brand}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
            >
              {brand}
            </span>
          ))}
        </div>

        {/* Informacje telekomunikacyjne */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Adres IOD:</span>
            </span>
            <span className="font-mono text-emerald-400 select-all">{operator.dpoEmail}</span>
          </div>

          {operator.edoreczeniaAde && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>e-Doręczenia ADE:</span>
              </span>
              <span className="font-mono text-cyan-400 text-[11px] select-all">{operator.edoreczeniaAde}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">Koszt duplikatu SIM:</span>
            <span className="font-semibold text-slate-200">{operator.duplicateCost}</span>
          </div>
        </div>

        {/* Wybór kanału nadania */}
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-xs text-slate-400">Kanał nadania:</span>
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setChannel('EMAIL')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                channel === 'EMAIL'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              E-mail IOD (.eml)
            </button>
            <button
              type="button"
              onClick={() => setChannel('EDORECZENIA')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                channel === 'EDORECZENIA'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              e-Doręczenia ADE
            </button>
          </div>
        </div>
      </div>

      {/* Przyciski Akcji */}
      <div className="mt-5 space-y-2 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          {/* Pobierz PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isGeneratingPdf ? 'Generowanie...' : 'Pobierz PDF A4'}</span>
          </button>

          {/* Akcja zależna od kanału */}
          {channel === 'EMAIL' ? (
            <button
              type="button"
              onClick={handleDownloadEml}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Pobierz .EML</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyEdoreczenia}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-800/80 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Skopiowano!' : 'Kopiuj dla ADE'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {channel === 'EMAIL' && (
            <a
              href={buildMailtoUri(profile, operator)}
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Otwórz mailto:</span>
            </a>
          )}

          <a
            href="https://moj.gov.pl/nforms/signer/upload?xFormsAppName=SIGNER"
            target="_blank"
            rel="noopener noreferrer"
            title="Podpisz pobrany PDF Profilem Zaufanym na gov.pl"
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition"
          >
            <span>Podpisz na gov.pl</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {/* Zmiana statusu na WYSŁANO */}
        {status !== 'SENT' && status !== 'REPLIED' && (
          <button
            type="button"
            onClick={handleMarkAsSent}
            className="w-full mt-2 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Oznacz jako wysłane (Start SLA 30 dni)</span>
          </button>
        )}

        {status === 'SENT' && (
          <div className="w-full mt-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center space-x-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SLA 30 dni aktywne</span>
              </span>
              <button
                type="button"
                onClick={() => onUpdateStatus(operator.id, 'DRAFT', channel)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                title="Cofnij do szkicu jeśli oznaczono omyłkowo"
              >
                Cofnij
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenResponseModal(operator)}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Zarejestruj odpowiedź operatora</span>
            </button>
          </div>
        )}

        {status === 'REPLIED' && (
          <div className="w-full mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                {result === 'FOUND_NUMBERS'
                  ? 'Zidentyfikowano numery'
                  : result === 'NO_NUMBERS'
                  ? 'Brak numerów w sieci'
                  : 'Odpowiedź zarejestrowana'}
              </span>
              <button
                type="button"
                onClick={() => onOpenResponseModal(operator)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Edytuj
              </button>
            </div>

            <button
              type="button"
              onClick={() => onResetToSla(operator.id)}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition"
              title="Wznów w SLA i zacznij odliczanie terminu 30 dni od nowa"
            >
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>Wznów w SLA (Wyślij ponowny wniosek)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
