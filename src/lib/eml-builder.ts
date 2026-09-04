import { TelcoOperator, UserProfile } from '../types';
import { generateLegalBriefText } from './pdf-generator';

export interface EmlContent {
  raw: string;
  filename: string;
  subject: string;
}

/**
 * Kompiluje pełną strukturę RFC 822 wiadomości pocztowej (.eml)
 * z zachowaniem pełnego kodowania UTF-8 i właściwych nagłówków MIME.
 */
export function buildEmlMessage(profile: UserProfile, operator: TelcoOperator): EmlContent {
  const dateStr = new Date().toUTCString();
  const subject = `Wniosek o dostęp do danych (art. 15 RODO) – audyt zarejestrowanych kart SIM i numerów MSISDN (PESEL: ${profile.pesel})`;
  const body = generateLegalBriefText(profile, operator);

  // Bezpieczne kodowanie tematu RFC 2047 Base64
  const subjectB64 = btoa(unescape(encodeURIComponent(subject)));
  const encodedSubject = `=?UTF-8?B?${subjectB64}?=`;

  const raw = [
    `From: "${profile.firstName} ${profile.lastName}" <${profile.contactEmail}>`,
    `To: "Inspektor Ochrony Danych ${operator.name}" <${operator.dpoEmail}>`,
    `Subject: ${encodedSubject}`,
    `Date: ${dateStr}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    `X-Mailer: TelcoAudit Pro RODO Hub (RFC 822 Standard)`,
    ``,
    body
  ].join('\r\n');

  const safeOpName = operator.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `wniosek_rodo_sim_${safeOpName}_${profile.pesel}.eml`;

  return {
    raw,
    filename,
    subject
  };
}

/**
 * Generuje łącze URI mailto: z prawidłowymi parametrami URL
 */
export function buildMailtoUri(profile: UserProfile, operator: TelcoOperator): string {
  const subject = `Wniosek o dostęp do danych (art. 15 RODO) - wykaz kart SIM (PESEL: ${profile.pesel})`;
  const body = `Szanowny Inspektorze Ochrony Danych (${operator.legalEntity}),\n\n` +
    `W załączeniu przekazuję oficjalny wniosek w trybie art. 15 RODO o udostępnienie rejestru numerów telefonów zarejestrowanych na moje dane (PESEL: ${profile.pesel}).\n\n` +
    `Pismo zostało wygenerowane zgodnie z wymogami Prawa Komunikacji Elektronicznej i opatrzone Podpisem Zaufanym / kwalifikowanym.\n\n` +
    `Z poważaniem,\n${profile.firstName} ${profile.lastName}\nE-mail: ${profile.contactEmail}`;

  return `mailto:${operator.dpoEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
