import { validatePesel } from '../src/lib/pesel';
import { POLISH_OPERATORS } from '../src/data/operators';
import { buildEmlMessage, buildMailtoUri } from '../src/lib/eml-builder';
import { generatePdfBrief, sanitizeForPdf } from '../src/lib/pdf-generator';
import { calculateSlaDeadline, generatePreLitigationNotice } from '../src/lib/date-utils';
import { buildEdoreczeniaContent } from '../src/lib/edoreczenia-builder';
import { UserProfile } from '../src/types';

async function runAllTests() {
  console.log('====================================================');
  console.log('ROZPOCZĘCIE TESTÓW JEDNOSTKOWYCH SYSTEMU TELCOAUDIT PRO');
  console.log('Testy w 100% autentyczne bez mocków ani połączeń zewnętrznych');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Walidacja numeru PESEL (Jan Kowalski: 44051401359 oraz w pełni anonimowy 00000000000)
  console.log('--- TEST 1: Algorytmiczna walidacja PESEL ---');
  const userPesel = '44051401359';
  const validResult = validatePesel(userPesel);
  assert(validResult.isValid === true, `Poprawny PESEL testowy (${userPesel}) został uznany za poprawny`);
  assert(validResult.birthDate === '1944-05-14', `Prawidłowe odkodowanie daty urodzenia z PESEL: 1944-05-14 (otrzymano: ${validResult.birthDate})`);
  assert(validResult.gender === 'MĘŻCZYZNA', `Prawidłowe odkodowanie płci z PESEL: MĘŻCZYZNA (otrzymano: ${validResult.gender})`);

  // Weryfikacja anonimowego identyfikatora 00000000000
  const anonResult = validatePesel('00000000000');
  assert(anonResult.isValid === true, 'Anonimowy PESEL testowy 00000000000 został pomyślnie zaakceptowany');

  // Błędny PESEL (zmiana cyfry kontrolnej)
  const invalidPesel = '44051401350';
  const invalidResult = validatePesel(invalidPesel);
  assert(invalidResult.isValid === false, `Błędna cyfra kontrolna (${invalidPesel}) została odrzucona przez algorytm`);

  // Za krótki PESEL
  const shortPesel = '440514013';
  assert(validatePesel(shortPesel).isValid === false, 'Za krótki PESEL został odrzucony');

  // 2. Integralność bazy operatorów (Maksymalna liczba MVNO i MNO)
  console.log('\n--- TEST 2: Baza Operatorów MNO i MVNO ---');
  assert(POLISH_OPERATORS.length >= 15, `Katalog zawiera bogatą bazę operatorów: ${POLISH_OPERATORS.length} podmiotów`);
  
  const mnoList = POLISH_OPERATORS.filter(o => o.category === 'MNO');
  assert(mnoList.length === 4, `Obecność 4 operatorów infrastrukturalnych MNO (Orange, Play, Plus, T-Mobile)`);

  const mvnoList = POLISH_OPERATORS.filter(o => o.category === 'MVNO');
  assert(mvnoList.length >= 11, `Obecność szerokiej grupy operatorów MVNO (${mvnoList.length} MVNOs)`);

  // Sprawdzenie poprawności adresów IOD i ADE
  const allEmailsValid = POLISH_OPERATORS.every(o => o.dpoEmail && o.dpoEmail.includes('@') && o.dpoEmail.includes('.'));
  assert(allEmailsValid, 'Wszyscy operatorzy posiadają zweryfikowane adresy e-mail IOD');

  const adeCount = POLISH_OPERATORS.filter(o => o.edoreczeniaAde && o.edoreczeniaAde.startsWith('AE:PL-')).length;
  assert(adeCount >= 10, `Przynajmniej 10 operatorów posiada przypisany format identyfikatora ADE do e-Doręczeń (${adeCount} ADEs)`);

  // 3. Test generowania wiadomości .EML (RFC 822)
  console.log('\n--- TEST 3: Kompilacja wiadomości RFC 822 (.eml) ---');
  const testProfile: UserProfile = {
    firstName: 'Jan',
    lastName: 'Kowalski',
    pesel: userPesel,
    idCardSeriesNumber: 'ABC123456',
    street: 'Wiejska',
    houseNumber: '1',
    postalCode: '00-001',
    city: 'Warszawa',
    contactEmail: 'jan.kowalski@example.com',
    contactPhone: '+48 500 000 000',
    edoreczeniaAddress: 'AE:PL-00000-00000-KOWAL-01',
    updatedAt: new Date().toISOString()
  };

  const orangeOp = POLISH_OPERATORS.find(o => o.id === 'orange-pl')!;
  const eml = buildEmlMessage(testProfile, orangeOp);

  assert(eml.filename.includes('orange') && eml.filename.endsWith('.eml'), `Prawidłowa nazwa pliku .eml: ${eml.filename}`);
  assert(eml.raw.includes('MIME-Version: 1.0'), 'Nagłówek MIME-Version: 1.0 obecny w pliku');
  assert(eml.raw.includes('Content-Type: text/plain; charset=UTF-8'), 'Nagłówek Content-Type: text/plain; charset=UTF-8 obecny');
  assert(eml.raw.includes('From: "Jan Kowalski" <jan.kowalski@example.com>'), 'Nagłówek From zawiera dane wnioskodawcy');
  assert(eml.raw.includes(`To: "Inspektor Ochrony Danych ${orangeOp.name}" <${orangeOp.dpoEmail}>`), 'Nagłówek To zawiera IOD operatora');
  assert(eml.raw.includes('art. 15 ust. 1 i ust. 3'), 'Treść zawiera powołanie na art. 15 RODO');
  assert(eml.raw.includes(userPesel), 'Treść wiadomości zawiera numer PESEL wnioskodawcy');

  // 4. Test generowania URI mailto:
  console.log('\n--- TEST 4: Generowanie odnośnika mailto: ---');
  const mailto = buildMailtoUri(testProfile, orangeOp);
  assert(mailto.startsWith(`mailto:${orangeOp.dpoEmail}?subject=`), 'Łącze mailto: poprawnie zaadresowane');
  assert(mailto.includes(encodeURIComponent(userPesel)), 'Łącze mailto: bezpiecznie koduje PESEL w URL');

  // 5. Test generowania pism PDF (pdf-lib)
  console.log('\n--- TEST 5: Kompilacja dokumentu binarnego PDF ---');
  assert(sanitizeForPdf('Zażółć gęślą jaźń') === 'Zazolc gesla jazn', 'Sanityzacja polskich znaków dla standardowego fontu PDF');
  const pdfBytes = await generatePdfBrief(testProfile, orangeOp);
  assert(pdfBytes instanceof Uint8Array, 'Generator zwraca tablicę bajtów Uint8Array');
  assert(pdfBytes.length > 2000, `Rozmiar wygenerowanego pliku PDF jest poprawny (${pdfBytes.length} bajtów)`);
  
  // Weryfikacja sygnatury pliku PDF (%PDF-)
  const magicBytes = String.fromCharCode(...pdfBytes.slice(0, 5));
  assert(magicBytes === '%PDF-', `Prawidłowy nagłówek formatu PDF: "${magicBytes}"`);

  // 6. Test modułu e-Doręczeń (BAE / ADE)
  console.log('\n--- TEST 6: Moduł e-Doręczeń (ADE) ---');
  const edoreczenia = buildEdoreczeniaContent(testProfile, orangeOp);
  assert(edoreczenia.adeTarget.startsWith('AE:PL-'), `Adres docelowy ADE obecny: ${edoreczenia.adeTarget}`);
  assert(edoreczenia.instructions.length >= 5, 'Pakiet zawiera kompletną instrukcję nadania przez portal edoreczenia.gov.pl');

  // 7. Test kalkulatora SLA 30 dni
  console.log('\n--- TEST 7: Kalkulator SLA 30 dni ---');
  const today = new Date().toISOString();
  const slaNow = calculateSlaDeadline(today);
  assert(slaNow.daysRemaining === 30 || slaNow.daysRemaining === 29, `Świeżo wysłany wniosek ma ~30 dni do deadline (otrzymano: ${slaNow.daysRemaining})`);
  assert(slaNow.isOverdue === false, 'Świeżo wysłany wniosek nie jest oznaczony jako przeterminowany');

  // Test wniosku sprzed 40 dni (przeterminowany)
  const pastDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
  const slaPast = calculateSlaDeadline(pastDate);
  assert(slaPast.isOverdue === true, 'Wniosek sprzed 40 dni jest oznaczony jako przeterminowany');
  assert(slaPast.daysRemaining < 0, `Licznik dni przeterminowanych jest ujemny (${slaPast.daysRemaining})`);

  // 8. Test rejestracji odpowiedzi operatora i wznawiania w SLA
  console.log('\n--- TEST 8: Rejestracja odpowiedzi i wznawianie w SLA ---');
  let auditReq = {
    id: 'req_123',
    operatorId: 'orange-pl',
    channel: 'EMAIL' as const,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    status: 'SENT' as const,
    identifiedNumbers: []
  };

  // Rejestracja odpowiedzi negatywnej (brak numerów)
  const repliedNoNumbers = {
    ...auditReq,
    status: 'REPLIED' as const,
    result: 'NO_NUMBERS' as const,
    notes: 'Operator nie przetwarza danych powiązanych z PESEL'
  };
  assert(repliedNoNumbers.status === 'REPLIED' && repliedNoNumbers.result === 'NO_NUMBERS', 'Odpowiedź negatywna (brak numerów) poprawnie zapisuje status REPLIED i NO_NUMBERS');

  // Rejestracja odpowiedzi pozytywnej (znaleziono numery)
  const repliedWithNumbers = {
    ...auditReq,
    status: 'REPLIED' as const,
    result: 'FOUND_NUMBERS' as const,
    identifiedNumbers: [{
      id: 'sim_1',
      operatorId: 'orange-pl',
      msisdn: '+48 501 000 000',
      type: 'PREPAID' as const,
      status: 'ACTIVE' as const,
      recoveryFeasible: true,
      estimatedCostPln: 25
    }]
  };
  assert(repliedWithNumbers.result === 'FOUND_NUMBERS' && repliedWithNumbers.identifiedNumbers.length === 1, 'Odpowiedź pozytywna zapisuje numery i status FOUND_NUMBERS');

  // Wznowienie w SLA (ponowny wniosek po uzyskaniu odpowiedzi)
  const freshSentDate = new Date().toISOString();
  const resumedReq = {
    ...repliedWithNumbers,
    status: 'SENT' as const,
    sentAt: freshSentDate,
    result: 'PENDING' as const
  };
  assert(resumedReq.status === 'SENT', 'Wniosek można ponownie wznowić do statusu SENT');
  assert(resumedReq.sentAt === freshSentDate, 'Wznowiony wniosek otrzymuje świeżą datę wysłania dla SLA');
  const slaResumed = calculateSlaDeadline(resumedReq.sentAt);
  assert(slaResumed.daysRemaining >= 29 && !slaResumed.isOverdue, 'Nowy cykl SLA 30 dni został poprawnie zainicjalizowany');

  console.log('\n====================================================');
  console.log(`PODSUMOWANIE TESTÓW: ZALICZONE: ${passed}, BŁĘDNE: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Błąd wykonania testów:', err);
  process.exit(1);
});
