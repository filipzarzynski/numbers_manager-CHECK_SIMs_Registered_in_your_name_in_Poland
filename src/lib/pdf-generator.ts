import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TelcoOperator, UserProfile } from '../types';

/**
 * Zamienia polskie znaki diakrytyczne na odpowiedniki ASCII dla standardowych fontów PDF
 * (WinAnsiEncoding wbudowane w bibliotekę pdf-lib bez zewnętrznych zależności fontowych).
 */
export function sanitizeForPdf(text: string): string {
  const diacriticsMap: Record<string, string> = {
    'ą': 'a', 'Ą': 'A',
    'ć': 'c', 'Ć': 'C',
    'ę': 'e', 'Ę': 'E',
    'ł': 'l', 'Ł': 'L',
    'ń': 'n', 'Ń': 'N',
    'ó': 'o', 'Ó': 'O',
    'ś': 's', 'Ś': 'S',
    'ź': 'z', 'Ź': 'Z',
    'ż': 'z', 'Ż': 'Z'
  };

  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => diacriticsMap[match] || match);
}

export function generateLegalBriefText(profile: UserProfile, operator: TelcoOperator, dateStr: string = new Date().toISOString().split('T')[0]): string {
  const apt = profile.apartmentNumber ? ` m. ${profile.apartmentNumber}` : '';
  const phone = profile.contactPhone ? `\nNumer kontaktowy: ${profile.contactPhone}` : '';
  const ade = profile.edoreczeniaAddress ? `\nAdres do e-Doreczeń (ADE): ${profile.edoreczeniaAddress}` : '';

  return `Miejscowość: ${profile.city}, Data: ${dateStr}

WNIOSKODAWCA:
Imię i nazwisko: ${profile.firstName} ${profile.lastName}
PESEL: ${profile.pesel}
Dokument tożsamości: ${profile.idCardSeriesNumber}
Adres zamieszkania: ul. ${profile.street} ${profile.houseNumber}${apt}, ${profile.postalCode} ${profile.city}
Adres e-mail do odpowiedzi: ${profile.contactEmail}${phone}${ade}

DO:
Inspektor Ochrony Danych
${operator.legalEntity}
${operator.registrationAddress}
Adres e-mail IOD: ${operator.dpoEmail}
${operator.edoreczeniaAde ? `Adres e-Doręczeń podmiotu (ADE): ${operator.edoreczeniaAde}` : ''}

DOTYCZY: WNIOSEK O REALIZACJĘ PRAWA DOSTĘPU DO DANYCH OSOBOWYCH (ART. 15 RODO)
ORAZ PRZEKAZANIE PEŁNEGO ZESTAWIENIA ZAREJESTROWANYCH NUMERÓW MSISDN I KART SIM

Działając na podstawie art. 15 ust. 1 i ust. 3 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych (RODO), niniejszym zwracam się z formalnym wnioskiem o uzyskanie dostępu do moich danych osobowych przetwarzanych przez Państwa spółkę oraz sporządzenie i wydanie ich bezpłatnej kopii.

W związku z realizacją uprawnień abonenckich oraz weryfikacją prawidłowości danych przetwarzanych na podstawie ustawy z dnia 12 lipca 2024 r. Prawo Komunikacji Elektronicznej (Dz.U. 2024 poz. 1221), wnoszę o:

1. Udzielenie informacji, czy Państwa spółka przetwarza jakiekolwiek dane osobowe powiązane z moim numerem PESEL (${profile.pesel}) oraz wskazanym powyżej dokumentem tożsamości.
2. Przekazanie pełnego i wyczerpującego zestawienia wszystkich numerów telefonów komórkowych (MSISDN) oraz powiązanych numerów seryjnych kart SIM (ICCID), które są aktualnie lub były w przeszłości zarejestrowane na moje dane w Państwa sieci (zarówno w ofertach na kartę / prepaid, jak i w umowach abonamentowych / postpaid, w tym w ramach marek zależnych: ${operator.tradeBrands.join(', ')}).
3. Wskazanie bieżącego statusu technicznego każdego ze zidentyfikowanych numerów telefonów (w szczególności: aktywny, zablokowany, w okresie kwarantanny technicznej, wyłączony, zrecyklingowany).
4. Przekazanie informacji o planowanym okresie dalszego przechowywania danych w celach retencyjnych i rozliczeniowych.

Mając na uwadze dyspozycję art. 12 ust. 6 RODO w zakresie wiarygodnego potwierdzenia tożsamości wnioskodawcy, niniejszy wniosek zostaje opatrzony podpisem elektronicznym (Podpis Zaufany / Kwalifikowany Podpis Elektroniczny) bądź nadany przez zaufany system e-Doręczeń.

Odpowiedź wraz z kopią danych proszę przekazać drogą elektroniczną na mój adres e-mail: ${profile.contactEmail} lub na mój adres e-Doręczeń, bez zbędnej zwłoki, a w każdym razie w terminie jednego miesiąca od dnia otrzymania wniosku, zgodnie z art. 12 ust. 3 RODO.

Z poważaniem,
${profile.firstName} ${profile.lastName}
[Dokument sporządzony do opatrzenia Podpisem Zaufanym na portalu gov.pl]`;
}

export async function generatePdfBrief(profile: UserProfile, operator: TelcoOperator): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // Format A4 w punktach
  const { height, width } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 45;
  let y = height - margin;

  const drawText = (
    text: string,
    size: number = 10,
    isBold: boolean = false,
    color = rgb(0.1, 0.1, 0.1)
  ) => {
    const font = isBold ? fontBold : fontRegular;
    const sanitized = sanitizeForPdf(text);
    page.drawText(sanitized, {
      x: margin,
      y,
      size,
      font,
      color,
    });
    y -= size + 5;
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: margin, y: y + 2 },
      end: { x: width - margin, y: y + 2 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 8;
  };

  // Nagłówek
  const dateStr = new Date().toISOString().split('T')[0];
  page.drawText(`Miejscowosc: ${sanitizeForPdf(profile.city)}, Data: ${dateStr}`, {
    x: width - margin - 220,
    y,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3)
  });
  y -= 25;

  // Wnioskodawca i Adresat w dwóch kolumnach
  const topY = y;
  
  // Lewa kolumna: Wnioskodawca
  page.drawText('WNIOSKODAWCA:', { x: margin, y, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 13;
  page.drawText(`${sanitizeForPdf(profile.firstName)} ${sanitizeForPdf(profile.lastName)}`, { x: margin, y, size: 9, font: fontRegular });
  y -= 12;
  page.drawText(`PESEL: ${profile.pesel}`, { x: margin, y, size: 9, font: fontRegular });
  y -= 12;
  page.drawText(`Dok. tozsam.: ${sanitizeForPdf(profile.idCardSeriesNumber)}`, { x: margin, y, size: 9, font: fontRegular });
  y -= 12;
  const apt = profile.apartmentNumber ? ` m. ${profile.apartmentNumber}` : '';
  page.drawText(`${sanitizeForPdf(profile.street)} ${sanitizeForPdf(profile.houseNumber)}${apt}`, { x: margin, y, size: 9, font: fontRegular });
  y -= 12;
  page.drawText(`${profile.postalCode} ${sanitizeForPdf(profile.city)}`, { x: margin, y, size: 9, font: fontRegular });
  y -= 12;
  page.drawText(`E-mail: ${sanitizeForPdf(profile.contactEmail)}`, { x: margin, y, size: 9, font: fontRegular });

  // Prawa kolumna: Adresat
  let rightY = topY;
  const rightX = width / 2 + 10;
  page.drawText('DO ADMINISTRATORA DANYCH:', { x: rightX, y: rightY, size: 9, font: fontBold });
  rightY -= 13;
  page.drawText('Inspektor Ochrony Danych', { x: rightX, y: rightY, size: 9, font: fontRegular });
  rightY -= 12;
  page.drawText(sanitizeForPdf(operator.legalEntity.substring(0, 38)), { x: rightX, y: rightY, size: 9, font: fontRegular });
  rightY -= 12;
  page.drawText(sanitizeForPdf(operator.registrationAddress.substring(0, 38)), { x: rightX, y: rightY, size: 9, font: fontRegular });
  rightY -= 12;
  page.drawText(`E-mail IOD: ${operator.dpoEmail}`, { x: rightX, y: rightY, size: 9, font: fontRegular });
  if (operator.edoreczeniaAde) {
    rightY -= 12;
    page.drawText(`ADE: ${operator.edoreczeniaAde}`, { x: rightX, y: rightY, size: 9, font: fontRegular });
  }

  y = Math.min(y, rightY) - 15;
  drawLine();

  // Tytuł pisma
  y -= 5;
  drawText('WNIOSEK O REALIZACJE PRAWA DOSTEPU DO DANYCH OSOBOWYCH (ART. 15 RODO)', 11, true, rgb(0.05, 0.2, 0.4));
  drawText('ORAZ WYKAZ ZAREJESTROWANYCH NUMEROW TELEFONICZNYCH (MSISDN / ICCID)', 10, true, rgb(0.05, 0.2, 0.4));
  y -= 5;

  // Treść formalna
  const legalParagraphs = [
    `Dzialajac na podstawie art. 15 ust. 1 i ust. 3 Rozporzadzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) w zwiazku z przepisami ustawy z dnia 12 lipca 2024 r. Prawo Komunikacji Elektronicznej (Dz.U. 2024 poz. 1221), niniejszym zwracam sie z formalnym wnioskiem o udostepnienie i wydanie bezplatnej kopii moich danych osobowych przetwarzanych w Panstwa strukturach bilingowych i archiwalnych.`,
    `W szczegolnosci wnosze o:`,
    `1. Udzielenie informacji, czy Panstwa spolka przetwarza jakiekolwiek dane osobowe powiazane z moim numerem PESEL (${profile.pesel}) oraz seria/nr dokumentu ${sanitizeForPdf(profile.idCardSeriesNumber)}.`,
    `2. Przekazanie kompletnego zestawienia wszystkich numerow stacji ruchomych (MSISDN) oraz powiazanych numerow seryjnych kart SIM (ICCID), zarejestrowanych aktualnie lub w przeszlosci na moje dane (w tym w markach: ${sanitizeForPdf(operator.tradeBrands.join(', '))}).`,
    `3. Okreslenie biezacego statusu technicznego kazdego numeru (aktywny, zablokowany, kwarantanna techniczna, zrecyklingowany) oraz procedury ewentualnego wydania duplikatu SIM.`,
    `4. Poinformowanie o przewidywanym okresie retencji danych w celach bilingowo-prawnych.`,
    `Wypelnienie dyspozycji art. 12 ust. 6 RODO: Niniejsze pismo zostaje opatrzone Podpisem Zaufanym (standard PAdES) za posrednictwem portalu gov.pl lub doreczone oficjalnym kanalem e-Doreczen (Baza Adresow Elektronicznych).`,
    `Zgodnie z art. 12 ust. 3 RODO odpowiedz nalezy przekazac bez zbednej zwloki, nie pozniej niz w terminie 1 miesiaca na podany adres e-mail: ${profile.contactEmail}.`
  ];

  for (const para of legalParagraphs) {
    // Proste dzielenie wierszy
    const words = para.split(' ');
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + word).length > 82) {
        drawText(currentLine, 9, false);
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim().length > 0) {
      drawText(currentLine, 9, false);
    }
    y -= 4;
  }

  y -= 15;
  drawText('Z powazaniem,', 10, false);
  drawText(`${sanitizeForPdf(profile.firstName)} ${sanitizeForPdf(profile.lastName)}`, 10, true);
  y -= 3;
  drawText('[Dokument przygotowany do certyfikacji Podpisem Zaufanym / e-Doreczeniami]', 8, false, rgb(0.4, 0.4, 0.4));

  return await pdfDoc.save();
}
