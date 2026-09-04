# TelcoAudit Pro — Audyt Kart SIM i Agregacja Wniosków RODO Art. 15
### (Check SIMs Registered In Your Name In Poland)

🌐 **Wersja Online / Live Web App**: **[http://sim.filip.digital/](http://sim.filip.digital/)**

[![Live Demo](https://img.shields.io/badge/Live-sim.filip.digital-emerald?logo=googlechrome)](http://sim.filip.digital/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Published-blue?logo=github)](http://sim.filip.digital/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal?logo=tailwind-css)](https://tailwindcss.com/)
[![Zero--Knowledge](https://img.shields.io/badge/Security-Zero--Knowledge-emerald)](https://gdpr.eu/)
[![Tests](https://img.shields.io/badge/Tests-35%2F35%20Passing%20(No%20Mocks)-brightgreen)](tests/core.test.ts)

---

## 🎯 Dlaczego powstał ten projekt? / Why this project was made

### Kontekst problemu (PL):
Osoby pracujące zawodowo przy testowaniu urządzeń mobilnych, smartfonów czy infrastruktury teleinformatycznej w ciągu kilku lat akumulują dziesiątki zarejestrowanych na siebie kart SIM (często 30 i więcej) u najróżniejszych operatorów infrastrukturalnych (MNO) oraz wirtualnych (MVNO).

Wraz z upływem czasu fizyczne nośniki (karty SIM z układami ICCID) ulegają zagubieniu, uszkodzeniu lub dezaktywacji. Powstaje krytyczny problem ewidencyjny:
1. **Brak centralnego rejestru państwowego**: W Polsce nie istnieje publiczna baza (nawet na gov.pl czy w rejestrze PESEL), która pozwalałaby sprawdzić listę numerów telefonów przypisanych do danej osoby.
2. **Zawodność standardowych metod diagnostycznych**:
   - Krótkie kody USSD (`*121#`, `*132#`, `*555`, `*100#`) wymagają fizycznego posiadania karty SIM włożonej do telefonu i zalogowanej do stacji bazowej BTS.
   - Portale i aplikacje samoobsługowe telekomów (Mój Orange, Play24, iPlus) wymagają jednorazowych kodów SMS (OTP/2FA) wysyłanych na utracony numer.
   - Występuje tzw. *błąd dzielenia kartotek bilingowych* – u operatorów numery rejestrowane w różnym czasie często trafiają do odseparowanych kont abonenckich niewidocznych dla konsultantów pierwszej linii wsparcia.

### Podstawa Prawna i Rozwiązanie Techniczne:
Jedynym skutecznym i prawnie wiążącym instrumentem jest realizacja prawa dostępu do danych osobowych na podstawie **art. 15 ust. 1 i 3 RODO** w zw. z ustawą z dnia 12 lipca 2024 r. **Prawo Komunikacji Elektronicznej (PKE)**. Wniosek skierowany bezpośrednio do **Inspektorów Ochrony Danych (IOD)** operatorów obliguje komórki compliance telekomu do przeszukania wszystkich baz bilingowych, hurtowni danych i archiwów retencyjnych oraz bezpłatnego przekazania pełnego zestawienia numerów **MSISDN** i **ICCID** w ustawowym terminie **30 dni** (art. 12 ust. 3 RODO).

Aplikacja **TelcoAudit Pro** powstała, by zagregować ten proces w jedno bezpieczne, zautomatyzowane narzędzie lokalne.

---

## ✨ Kluczowe Funkcjonalności

1. **Prywatność Zero-Knowledge (Client-Side Only)**:
   - Żadne dane osobowe (PESEL, seria dowodu tożsamości, imię, nazwisko, adres) **nie opuszczają Twojej przeglądarki**.
   - Przetwarzanie i przechowywanie odbywa się w 100% lokalnie w pamięci przeglądarki (`localStorage`). Brak zewnętrznych serwerów bazodanowych czy API zbierających PII.
   - Eksport i import pełnej kopii zapasowej do pliku JSON.

2. **Katalog 17 Operatorów Telekomunikacyjnych (MNO & MVNO)**:
   - **MNO (Infrastrukturalni)**: Orange Polska (Orange, nju mobile, Orange Flex), Play (P4, Virgin Mobile, Red Bull Mobile, UPC Mobile), Plus (Polkomtel, Plush), T-Mobile Polska (T-Mobile, Heyah, tuBiedronka).
   - **MVNO (Wirtualni)**: Mobile Vikings, Premium Mobile, a2mobile, Otvarta, Netia, Vectra / Multimedia Polska, Lyca Mobile, Lajt Mobile (Telestrada), Fonia Telecom, Cross Mobile, TOYA, INEA.
   - Zaktualizowane adresy e-mail IOD, dane rejestrowe oraz adresy ADE do e-Doręczeń.

3. **Kompleksowe Generowanie Wniosków**:
   - **Pliki PDF A4**: Gotowe, sformatowane pisma urzędowe do opatrzenia bezpłatnym **Podpisem Zaufanym (PAdES)** na gov.pl.
   - **Pliki pocztowe `.eml` (RFC 822)**: Kompletne projekty wiadomości z nagłówkami MIME (do otwarcia w Thunderbird, Outlook, Apple Mail).
   - **Łącza `mailto:`**: Bezpośrednie uruchomienie domyślnego klienta poczty.
   - **Obsługa e-Doręczeń (BAE / ADE)**: Ustrukturyzowana treść pism wraz z identyfikatorami ADE podmiotów do nadania przez `edoreczenia.gov.pl` / `mobywatel.gov.pl` (ranga listu poleconego za zwrotnym potwierdzeniem odbioru).

4. **Monitoring SLA 30 Dni**:
   - Automatyczny licznik odliczający 30 dni ustawowego terminu (art. 12 ust. 3 RODO).
   - Ostrzeżenia o zbliżającym się terminie oraz alerty przeterminowania.
   - **Generator Ostatecznego Przedsądowego Wezwania (UODO)** w przypadku bezczynności operatora.

5. **Chroniony Przepływ Rejestracji Odpowiedzi**:
   - Wniosek pozostaje w toku SLA tak długo, aż użytkownik jednoznacznie zatwierdzi wynik.
   - Opcja **„Znaleziono numery (Wynik pozytywny)”** automatycznie dodaje odkryte MSISDN do ewidencji.
   - Opcja **„Brak numerów (Wynik negatywny)”** czysto zamyka sprawę.
   - Przycisk **„Wznów w SLA (Wyślij ponowny wniosek)”** pozwala w dowolnym momencie zrestartować cykl SLA.

6. **Ewidencja Numerów MSISDN & Kalkulator Budżetu**:
   - Klasyfikacja stanu: *Aktywny* (100% szans), *Pasywny* (>90%), *Kwarantanna techniczna 30-180 dni* (szansa warunkowa), *Zrecyklingowany* (0%).
   - Automatyczne wyliczanie szacowanych kosztów wyrobienia duplikatów SIM u poszczególnych operatorów i sumarycznego budżetu.
   - Eksport zestawienia do pliku CSV.

7. **Krytyczny Alert Anty-Fraudowy (mObywatel PESEL)**:
   - Wyjaśnienie mechanizmu blokowania terminali w salonach stacjonarnych: operatorzy w Polsce od 2024 r. mają ustawowy obowiązek sprawdzania rejestru **Zastrzeżeń PESEL**.
   - Instrukcja tymczasowego cofnięcia zastrzeżenia w aplikacji **mObywatel** przed wizytą w salonie w celu odbioru nowej karty SIM/eSIM.

8. **Wzorzec Testowy (Jan Kowalski) i Prywatność**:
   - Aplikacja jest domyślnie pusta dla nowych użytkowników i nie przechowuje żadnych danych osobowych w kodzie.
   - Do bezpiecznego przetestowania generatora wniosków i przepływów dostępny jest przycisk szybkiego wypełnienia anonimowym wzorcem: **Jan Kowalski**, PESEL: `44051401359` (lub testowy `00000000000`), e-mail: `jan.kowalski@example.com`.

---

## 🚀 Jak uruchomić projekt lokalnie / How to Run

Aplikacja jest w pełni skonteneryzowana za pomocą **Docker** i serwowana przez lekki serwer **Nginx Alpine**.

### Wymagania wstępne:
- Zainstalowany **Docker Desktop** (lub silnik Docker CLI z Docker Compose).

### Krok 1: Klonowanie repozytorium
```bash
git clone https://github.com/filipzarzynski/numbers_manager-CHECK_SIMs_Registered_in_your_name_in_Poland.git
cd numbers_manager-CHECK_SIMs_Registered_in_your_name_in_Poland
```

### Krok 2: Zbudowanie i uruchomienie kontenera
```bash
docker compose build
docker compose up -d
```

### Krok 3: Otwórz aplikację w przeglądarce
Przejdź pod adres:
👉 **[http://localhost:8080](http://localhost:8080)**

### Zatrzymanie kontenera:
```bash
docker compose down
```

---

## 🧪 Testy Jednostkowe (35/35 Passing, 0 Mocks)

W projekcie obowiązuje rygorystyczna zasada **braku implementacji pozornych (zero mocków)**. Wszystkie testy działają na autentycznych algorytmach i danych wejściowych:

- Algorytm sumy kontrolnej numeru PESEL (wagi `1, 3, 7, 9, 1, 3, 7, 9, 1, 3`, dekodowanie stuleci i daty urodzenia, płeć; weryfikacja oficjalnego wzorca Jan Kowalski `44051401359` oraz identyfikatora `00000000000`).
- Spójność bazy 17 operatorów telekomunikacyjnych (MNO, MVNO, formaty ADE, adresy IOD).
- Zgodność ze standardem RFC 822 wiadomości pocztowych `.eml` (nagłówki MIME, UTF-8 Base64 subject).
- Integralność binarna plików PDF (nagłówek `%PDF-`, sanityzacja diakrytyków w fontach podstawowych).
- Kalkulator 30-dniowego terminu ustawowego SLA i generator monitów UODO.
- Przepływ rejestracji odpowiedzi i reinicjalizacji cyklu SLA.

### Uruchomienie testów lokalnie (Node.js):
```bash
npm install
npm test
```
*Testy są również automatycznie wykonywane wewnątrz pierwszego etapu budowy obrazu Docker (`RUN npm test`).*

---

## 📁 Struktura Projektu

```
sim/
├── Dockerfile                  # Wieloetapowy build (Node 20 test & build -> Nginx 1.27 Alpine)
├── docker-compose.yml          # Konfiguracja kontenera na porcie 8080
├── nginx.conf                  # Serwowanie SPA z nagłówkami bezpieczeństwa i kompresją gzip
├── package.json                # Zależności: React, Vite, Tailwind CSS, pdf-lib, lucide-react
├── tsconfig.json               # Konfiguracja kompilatora TypeScript
├── vite.config.ts              # Konfiguracja bundlera Vite
├── tailwind.config.js          # Motyw ciemny Slate / Emerald
├── src/
│   ├── main.tsx                # Punkt wejścia React
│   ├── App.tsx                 # Główny stan i orkiestracja zakładek
│   ├── types/
│   │   └── index.ts            # Modele danych TypeScript (UserProfile, TelcoOperator, AuditRequest, MSISDN)
│   ├── data/
│   │   ├── operators.ts        # Baza 17 operatorów telekomunikacyjnych (MNO i MVNO)
│   │   └── ussd-codes.ts       # Tabela diagnostyczna kodów USSD i ograniczenia sprzętowe
│   ├── lib/
│   │   ├── pesel.ts            # Prawdziwy algorytm walidacji sumy kontrolnej PESEL
│   │   ├── pdf-generator.ts    # Kompilacja formalnych pism PDF (A4 z pdf-lib)
│   │   ├── eml-builder.ts      # Generator RFC 822 (.eml) i mailto:
│   │   ├── edoreczenia-builder.ts # Pismo ogólne i routing dla e-Doręczeń (BAE / ADE)
│   │   ├── date-utils.ts       # Licznik SLA 30 dni i generator wezwań przedsądowych
│   │   └── storage.ts          # Obsługa localStorage (Zero-Knowledge, backup/restore JSON)
│   └── components/
│       ├── Navbar.tsx          # Nawigacja i wskaźnik bezpieczeństwa Zero-Knowledge
│       ├── ProfileForm.tsx     # Formularz tożsamości z walidatorem PESEL
│       ├── OperatorCard.tsx    # Karta operatora z akcjami PDF/EML/ADE i SLA
│       ├── ResponseModal.tsx   # Modal rejestracji odpowiedzi (pozytywna/negatywna/anuluj)
│       ├── RequestTracker.tsx  # Panel monitorowania 30 dni SLA i zakończonych spraw
│       ├── InventoryTable.tsx  # Ewidencja numerów MSISDN z kalkulatorem kosztów i CSV
│       ├── KnowledgeHub.tsx    # Baza wiedzy (mObywatel PESEL, SIM Swap, procedury salonowe)
│       └── DataBackupModal.tsx # Eksport/Import stanu do JSON
└── tests/
    └── core.test.ts            # 34 autentyczne testy jednostkowe
```

---

## ⚖️ Licencja i Nota Prawna

Projekt udostępniany jest do celów audytu własnych danych telekomunikacyjnych oraz obrony praw konsumenckich na mocy art. 15 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO). Autorzy nie ponoszą odpowiedzialności za działania operatorów telekomunikacyjnych ani za decyzje odmowne wydawane przez poszczególne podmioty.
