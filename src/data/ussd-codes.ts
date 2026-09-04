import { UssdCodeInfo } from '../types';

export const USSD_CODES: UssdCodeInfo[] = [
  {
    operator: 'Play / Virgin Mobile',
    code: '*121#',
    method: 'Kod USSD zatwierdzany przyciskiem zielonej słuchawki',
    description: 'Wyświetla numer telefonu MSISDN przypisany do włożonej karty SIM. Alternatywnie SMS o treści "REJESTRACJA" pod bezpłatny numer 111.',
    requiresSim: true
  },
  {
    operator: 'Plus / Plush',
    code: '*132#',
    method: 'Kod USSD zatwierdzany połączeniem',
    description: 'Błyskawicznie zwraca z rejestru HLR numer telefonu. Alternatywnie SMS o treści "STATUS" pod 80104.',
    requiresSim: true
  },
  {
    operator: 'Orange Polska',
    code: '*555',
    method: 'Połączenie głosowe z bezpłatnym numerem i wybór tonowy "2"',
    description: 'Komunikat głosowy IVR odczytuje numer MSISDN. Alternatywnie bezpłatny SMS "numer" pod 80190.',
    requiresSim: true
  },
  {
    operator: 'T-Mobile / Heyah',
    code: '*100#',
    method: 'Kod szybkiego menu USSD',
    description: 'Otwiera menu abonenckie zawierające numer MSISDN. Alternatywnie połączenie pod *9898 (Heyah).',
    requiresSim: true
  },
  {
    operator: 'nju mobile',
    code: '*630',
    method: 'Połączenie głosowe z bezpłatnym automatem informacyjnym',
    description: 'Odczytuje bieżący numer telefonu i stan konta.',
    requiresSim: true
  },
  {
    operator: 'a2mobile',
    code: '*101#',
    method: 'Kod stanu konta lub aplikacja mobilna',
    description: 'Weryfikacja stanu konta i numeru telefonu.',
    requiresSim: true
  }
];

export const DIAGNOSTIC_LIMITATIONS_EXPLANATION = `
Dlaczego standardowe kody USSD i aplikacje operatorów nie wystarczą po zagubieniu karty SIM?
1. Zależność sprzętowa: Kody USSD (*121#, *132# itp.) wymagają aktywnego połączenia radiowego fizycznej karty SIM (ICCID) ze stacją bazową BTS operatora.
2. Bariera 2FA/OTP: Portale samoobsługowe (Mój Orange, Play24, iPlus) wymagają jednorazowego hasła SMS (OTP) do autoryzacji logowania, którego nie można odebrać bez karty.
3. Błąd dzielenia kartotek billingowych: Często rejestrowane w różnym czasie numery na ten sam PESEL trafiają do oddzielnych kont abonenckich u tego samego operatora.
4. Jedyne skuteczne rozwiązanie: Oficjalny wniosek prawny w trybie art. 15 RODO (Dostęp do danych osobowych) skierowany bezpośrednio do Inspektora Ochrony Danych (IOD) lub przez system e-Doręczeń.
`;
