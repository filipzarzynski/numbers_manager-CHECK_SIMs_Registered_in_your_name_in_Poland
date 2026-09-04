export interface UserProfile {
  firstName: string;
  lastName: string;
  pesel: string;
  idCardSeriesNumber: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  contactEmail: string;
  contactPhone?: string;
  edoreczeniaAddress?: string; // ADE: np. AE:PL-12345-67890-ABCDE-12
  updatedAt: string;
}

export type OperatorCategory = 'MNO' | 'MVNO';

export interface TelcoOperator {
  id: string;
  name: string;
  tradeBrands: string[];
  category: OperatorCategory;
  legalEntity: string;
  registrationAddress: string;
  dpoEmail: string;
  customerSupportEmail?: string;
  edoreczeniaAde?: string; // Adres do e-Doręczeń podmiotu (Baza Adresów Elektronicznych)
  authRequirements: 'PODPIS_ZAUFANY' | 'QES' | 'SALON_STATIONARY' | 'ANY_VERIFIED';
  duplicateCost: string;
  duplicateProcedure: string;
  estimatedCostPln: number;
  notes: string;
}

export type RequestStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'SENT'
  | 'AWAITING_REPLY'
  | 'REPLIED'
  | 'OVERDUE'
  | 'CLOSED';

export type DeliveryChannel = 'EMAIL' | 'EDORECZENIA';

export interface AuditRequest {
  id: string;
  operatorId: string;
  channel: DeliveryChannel;
  createdAt: string;
  sentAt?: string;
  deadlineDate?: string;
  status: RequestStatus;
  result?: 'FOUND_NUMBERS' | 'NO_NUMBERS' | 'PENDING';
  identifiedNumbers: DiscoveredNumber[];
  notes?: string;
}

export type SimStatus = 'ACTIVE' | 'PASSIVE' | 'QUARANTINED' | 'RECYCLED' | 'UNKNOWN';

export interface DiscoveredNumber {
  id: string;
  operatorId: string;
  msisdn: string;
  iccid?: string;
  type: 'PREPAID' | 'POSTPAID' | 'DATA_ONLY' | 'INACTIVE_QUARANTINE';
  status: SimStatus;
  recoveryFeasible: boolean;
  estimatedCostPln: number;
  notes?: string;
}

export interface UssdCodeInfo {
  operator: string;
  code: string;
  method: string;
  description: string;
  requiresSim: boolean;
}
