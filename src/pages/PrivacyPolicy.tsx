import PageLayout from '../components/PageLayout';

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">Polityka Prywatności</h1>
          <div className="prose prose-invert">
            <div className="text-gray-300 space-y-6">
              <h2 className="text-2xl font-semibold text-white mt-6">§1. Definicje</h2>
              <div className="ml-4 space-y-2">
                <p>1. <strong>Administrator</strong> – Stowarzyszenie Słowem w twarz z siedzibą w Rybniku, ul. Dworek 5/33, 44-200 Rybnik, KRS: 0000699712, NIP: 6423204888, REGON: 368529913, e-mail: biuro@slowemwtwarz.pl.</p>
                <p>2. <strong>Dane osobowe</strong> – wszelkie informacje dotyczące osoby fizycznej, której dane dotyczą, umożliwiające jej identyfikację, np. imię i nazwisko, adres e-mail, numer telefonu, adres IP.</p>
                <p>3. <strong>Pliki cookies</strong> – małe pliki tekstowe przechowywane na urządzeniach użytkowników, umożliwiające poprawne działanie serwisu oraz analizę jego funkcjonowania.</p>
                <p>4. <strong>RODO</strong> – Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych.</p>
                <p>5. <strong>Serwis</strong> – platforma internetowa prowadzona przez Administratora pod adresem "ImpactMarket.pl".</p>
                <p>6. <strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu, zarówno darczyńca, jak i beneficjent.</p>
                <p>7. <strong>Darowizna</strong> – środki pieniężne przekazywane na cele charytatywne i proekologiczne za pomocą Serwisu.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§2. Postanowienia ogólne</h2>
              <div className="ml-4 space-y-2">
                <p>1. Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych przez Administratora oraz prawa Użytkowników w związku z korzystaniem z Serwisu.</p>
                <p>2. Korzystanie z Serwisu oznacza akceptację niniejszej Polityki Prywatności.</p>
                <p>3. Dane osobowe Użytkowników są przetwarzane zgodnie z obowiązującymi przepisami prawa, w szczególności zgodnie z RODO oraz ustawą o ochronie danych osobowych z dnia 10 maja 2018 r.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§3. Cele oraz podstawy prawne przetwarzania danych osobowych</h2>
              <div className="ml-4 space-y-2">
                <p>1. Dane osobowe Użytkowników są przetwarzane w celu:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>realizacji darowizn oraz obsługi transakcji płatniczych (art. 6 ust. 1 lit. b RODO),</li>
                  <li>realizacji obowiązków wynikających z przepisów prawa, np. podatkowych i rachunkowych (art. 6 ust. 1 lit. c RODO),</li>
                  <li>analizy i statystyki korzystania z Serwisu (art. 6 ust. 1 lit. f RODO),</li>
                  <li>dochodzenia ewentualnych roszczeń lub obrony przed nimi (art. 6 ust. 1 lit. f RODO),</li>
                  <li>działań marketingowych, w tym wysyłki newslettera (art. 6 ust. 1 lit. a RODO).</li>
                </ul>
                <p>2. Podanie danych osobowych jest dobrowolne, jednak niezbędne do korzystania z usług Serwisu.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§4. Okres przetwarzania danych osobowych</h2>
              <div className="ml-4 space-y-2">
                <p>1. Dane osobowe są przetwarzane przez czas niezbędny do realizacji celu, dla którego zostały zebrane:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>przez okres realizacji darowizny oraz przez wymagany prawem okres przechowywania dokumentacji księgowej,</li>
                  <li>do momentu wycofania zgody przez Użytkownika w przypadku zgody na przetwarzanie danych w celach marketingowych,</li>
                  <li>do momentu przedawnienia roszczeń w przypadku przetwarzania danych w celu dochodzenia lub obrony roszczeń.</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§5. Odbiorcy danych</h2>
              <div className="ml-4 space-y-2">
                <p>1. Dane osobowe Użytkowników mogą być przekazywane:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>podmiotom obsługującym płatności (np. PayU),</li>
                  <li>dostawcom usług IT zapewniającym hosting i obsługę techniczną Serwisu,</li>
                  <li>organom publicznym, jeśli wynika to z przepisów prawa.</li>
                </ul>
                <p>2. Dane osobowe nie są przekazywane poza Europejski Obszar Gospodarczy (EOG).</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§6. Prawa Użytkowników</h2>
              <div className="ml-4 space-y-2">
                <p>1. Użytkownik ma prawo do:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>dostępu do swoich danych,</li>
                  <li>sprostowania nieprawidłowych danych,</li>
                  <li>usunięcia danych („prawo do bycia zapomnianym"),</li>
                  <li>ograniczenia przetwarzania danych,</li>
                  <li>przenoszenia danych do innego administratora,</li>
                  <li>wniesienia sprzeciwu wobec przetwarzania danych,</li>
                  <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
                </ul>
                <p>2. W celu realizacji powyższych praw Użytkownik może skontaktować się z Administratorem pod adresem e-mail: biuro@slowemwtwarz.pl.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§7. Pliki cookies</h2>
              <div className="ml-4 space-y-2">
                <p>1. Serwis korzysta z plików cookies w celu:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>zapewnienia prawidłowego funkcjonowania Serwisu,</li>
                  <li>analizy statystycznej ruchu na stronie,</li>
                  <li>prowadzenia działań marketingowych.</li>
                </ul>
                <p>2. Użytkownik może zarządzać plikami cookies poprzez ustawienia przeglądarki internetowej.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§8. Środki bezpieczeństwa</h2>
              <div className="ml-4 space-y-2">
                <p>1. Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem.</p>
                <p>2. Dostęp do danych osobowych mają jedynie upoważnione osoby zobowiązane do zachowania ich poufności.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§9. Zmiany w Polityce Prywatności</h2>
              <div className="ml-4 space-y-2">
                <p>1. Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności.</p>
                <p>2. Wszelkie zmiany zostaną opublikowane na stronie Serwisu i będą obowiązywać od dnia ich zamieszczenia.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§10. Kontakt</h2>
              <div className="ml-4 space-y-2">
                <p>1. W przypadku pytań dotyczących niniejszej Polityki Prywatności, Użytkownik może skontaktować się z Administratorem pod adresem e-mail: biuro@slowemwtwarz.pl.</p>
              </div>

              <p className="italic mt-8">Data wejścia w życie: 1 marca 2025 r.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 