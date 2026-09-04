import { TelcoOperator, UserProfile } from '../types';

export function calculateSlaDeadline(sentAtDate: string): { deadlineDate: string; daysRemaining: number; isOverdue: boolean } {
  const sent = new Date(sentAtDate);
  const deadline = new Date(sent.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const diffMs = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  return {
    deadlineDate: deadline.toISOString().split('T')[0],
    daysRemaining,
    isOverdue
  };
}

export function generatePreLitigationNotice(profile: UserProfile, operator: TelcoOperator, sentAtDate: string): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const { deadlineDate } = calculateSlaDeadline(sentAtDate);

  return `Miejscowość: ${profile.city}, Data: ${dateStr}

WNIOSKODAWCA:
${profile.firstName} ${profile.lastName}
PESEL: ${profile.pesel}
Adres: ul. ${profile.street} ${profile.houseNumber}, ${profile.postalCode} ${profile.city}
E-mail: ${profile.contactEmail}

DO:
Inspektor Ochrony Danych / Zarząd
${operator.legalEntity}
${operator.registrationAddress}
Adres e-mail: ${operator.dpoEmail}

DOTYCZY: OSTATECZNE PRZEDSĄDOWE WEZWANIE DO USUNIĘCIA NARUSZENIA PRAWA
(BRAK REALIZACJI OBOWIĄZKU Z ART. 15 RODO W USTAWOWYM TERMINIE Z ART. 12 UST. 3 RODO)

Szanowni Państwo,

W nawiązaniu do wniosku o realizację prawa dostępu do danych osobowych (art. 15 RODO) w zakresie zestawienia zarejestrowanych kart SIM i numerów MSISDN, złożonego w dniu ${sentAtDate.split('T')[0]}, wskazuję, że z dniem ${deadlineDate} bezskutecznie upłynął ustawowy miesięczny termin na udzielenie odpowiedzi wynikający z art. 12 ust. 3 RODO.

Do chwili obecnej Państwa spółka nie przekazała żądanych informacji ani nie wystosowała formalnego zawiadomienia o przedłużeniu terminu z podaniem przyczyn zwłoki.

W związku z powyższym, wzywam Państwa do niezwłocznego, nie później niż w terminie 7 dni od dnia otrzymania niniejszego wezwania, do przekazania pełnej kopii danych oraz wykazu numerów MSISDN.

W przypadku braku realizacji uprawnienia w zakreślonym terminie, sprawa zostanie bezzwłocznie skierowana do Prezesa Urzędu Ochrony Danych Osobowych (UODO) wraz z wnioskiem o nałożenie administracyjnej kary pieniężnej na podstawie art. 83 ust. 5 lit. b RODO oraz podjęte zostaną kroki na drodze postępowania cywilnego.

Z poważaniem,
${profile.firstName} ${profile.lastName}`;
}
