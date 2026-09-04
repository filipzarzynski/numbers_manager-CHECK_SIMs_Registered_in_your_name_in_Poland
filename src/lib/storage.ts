import { AuditRequest, DiscoveredNumber, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'telco_audit_profile_v1',
  REQUESTS: 'telco_audit_requests_v1',
  NUMBERS: 'telco_audit_numbers_v1',
};

// Pusty profil dla nowych użytkowników
export const EMPTY_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  pesel: '',
  idCardSeriesNumber: '',
  street: '',
  houseNumber: '',
  apartmentNumber: '',
  postalCode: '',
  city: '',
  contactEmail: '',
  contactPhone: '',
  edoreczeniaAddress: '',
  updatedAt: new Date().toISOString(),
};

// Domyślny profil bazowy z w pełni anonimowymi danymi testowymi (Jan Kowalski)
export const DEFAULT_TEST_PROFILE: UserProfile = {
  firstName: 'Jan',
  lastName: 'Kowalski',
  pesel: '44051401359',
  idCardSeriesNumber: 'ABC123456',
  street: 'Wiejska',
  houseNumber: '1',
  apartmentNumber: '',
  postalCode: '00-001',
  city: 'Warszawa',
  contactEmail: 'jan.kowalski@example.com',
  contactPhone: '+48 500 000 000',
  edoreczeniaAddress: 'AE:PL-00000-00000-KOWAL-01',
  updatedAt: new Date().toISOString(),
};

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Błąd odczytu profilu z localStorage:', e);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadAuditRequests(): AuditRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Błąd odczytu zapytań:', e);
    return [];
  }
}

export function saveAuditRequests(requests: AuditRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
}

export function loadDiscoveredNumbers(): DiscoveredNumber[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NUMBERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Błąd odczytu numerów:', e);
    return [];
  }
}

export function saveDiscoveredNumbers(numbers: DiscoveredNumber[]): void {
  localStorage.setItem(STORAGE_KEYS.NUMBERS, JSON.stringify(numbers));
}

export interface BackupData {
  version: string;
  exportedAt: string;
  profile: UserProfile | null;
  requests: AuditRequest[];
  numbers: DiscoveredNumber[];
}

export function exportBackupJson(): string {
  const data: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: loadUserProfile(),
    requests: loadAuditRequests(),
    numbers: loadDiscoveredNumbers(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const data: BackupData = JSON.parse(jsonString);
    if (data.profile) saveUserProfile(data.profile);
    if (Array.isArray(data.requests)) saveAuditRequests(data.requests);
    if (Array.isArray(data.numbers)) saveDiscoveredNumbers(data.numbers);
    return true;
  } catch (e) {
    console.error('Błąd importu pliku JSON:', e);
    return false;
  }
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.NUMBERS);
}
