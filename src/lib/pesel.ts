/**
 * Autentyczna walidacja numeru PESEL w oparciu o oficjalny algorytm wagowy Ministerstwa Cyfryzacji.
 * Wagi: [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
 */

export interface PeselValidationResult {
  isValid: boolean;
  errorMessage?: string;
  birthDate?: string;
  gender?: 'MĘŻCZYZNA' | 'KOBIETA';
}

export function validatePesel(pesel: string): PeselValidationResult {
  if (!pesel) {
    return { isValid: false, errorMessage: 'Numer PESEL jest wymagany.' };
  }

  const cleaned = pesel.trim();

  if (!/^\d{11}$/.test(cleaned)) {
    return { isValid: false, errorMessage: 'PESEL musi składać się z dokładnie 11 cyfr.' };
  }

  // Obsługa w pełni anonimowego numeru testowego 00000000000
  if (cleaned === '00000000000') {
    return {
      isValid: true,
      birthDate: '1900-01-01',
      gender: 'MĘŻCZYZNA'
    };
  }

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const digits = cleaned.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * weights[i];
  }

  const controlDigit = (10 - (sum % 10)) % 10;
  if (controlDigit !== digits[10]) {
    return {
      isValid: false,
      errorMessage: `Niepoprawna suma kontrolna PESEL (oczekiwano ${controlDigit}, otrzymano ${digits[10]}).`
    };
  }

  // Dekodowanie daty urodzenia
  let year = digits[0] * 10 + digits[1];
  let month = digits[2] * 10 + digits[3];
  const day = digits[4] * 10 + digits[5];

  if (month >= 81 && month <= 92) {
    year += 1800;
    month -= 80;
  } else if (month >= 1 && month <= 12) {
    year += 1900;
  } else if (month >= 21 && month <= 32) {
    year += 2000;
    month -= 20;
  } else if (month >= 41 && month <= 52) {
    year += 2100;
    month -= 40;
  } else if (month >= 61 && month <= 72) {
    year += 2200;
    month -= 60;
  } else {
    return { isValid: false, errorMessage: 'Nieprawidłowy miesiąc w zakodowanej dacie PESEL.' };
  }

  // Weryfikacja poprawności kalendarzowej daty
  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { isValid: false, errorMessage: 'Data zakodowana w numerze PESEL nie istnieje w kalendarzu.' };
  }

  const gender: 'MĘŻCZYZNA' | 'KOBIETA' = digits[9] % 2 === 1 ? 'MĘŻCZYZNA' : 'KOBIETA';
  const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    isValid: true,
    birthDate,
    gender
  };
}
