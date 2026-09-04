import { TelcoOperator, UserProfile } from '../types';
import { generateLegalBriefText } from './pdf-generator';

export interface EdoreczeniaBundle {
  adeTarget: string;
  subject: string;
  content: string;
  instructions: string[];
}

export function buildEdoreczeniaContent(profile: UserProfile, operator: TelcoOperator): EdoreczeniaBundle {
  const adeTarget = operator.edoreczeniaAde || 'Wyszukaj w Bazie Adresów Elektronicznych (BAE) po NIP lub nazwie spółki';
  const subject = `Wniosek RODO art. 15 – wykaz zarejestrowanych numerów MSISDN i kart SIM (PESEL: ${profile.pesel})`;
  const content = generateLegalBriefText(profile, operator);

  const instructions = [
    `1. Zaloguj się do portalu e-Doręczeń (edoreczenia.gov.pl lub mobywatel.gov.pl) za pomocą Profilu Zaufanego / mObywatela.`,
    `2. Kliknij "Nowa wiadomość" i wyszukaj adresata w Bazie Adresów Elektronicznych (BAE): ${operator.legalEntity} (Adres ADE: ${operator.edoreczeniaAde || 'wyszukaj po nazwie'}).`,
    `3. Wpisz temat: "${subject}".`,
    `4. Wklej wygenerowaną treść pisma w pole treści wiadomości.`,
    `5. Opcjonalnie załącz pobrany i podpisany wcześniej plik PDF.`,
    `6. Wyślij pismo. System wygeneruje urzędowy Dowód Wysłania i Dowód Doręczenia (PUH/PURDE) o randze listu poleconego za zwrotnym potwierdzeniem odbioru.`
  ];

  return {
    adeTarget,
    subject,
    content,
    instructions
  };
}
