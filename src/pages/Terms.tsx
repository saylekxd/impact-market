import React from 'react';
import PageLayout from '../components/PageLayout';

export default function Terms() {
  return (
    <PageLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">Regulamin</h1>
          <div className="prose prose-invert">
            <div className="text-gray-300 space-y-6">
              <h2 className="text-2xl font-semibold text-white mt-6">§1. Postanowienia ogólne</h2>
              <div className="ml-4 space-y-2">
                <p>1. Niniejszy Regulamin określa zasady korzystania z Serwisu internetowego <strong>ImpactMarket.pl</strong>, w tym zasady zawierania i realizacji umów o świadczenie usług drogą elektroniczną oraz procedury dotyczące dokonywania wpłat i obsługi transakcji finansowych.</p>
                <p>2. Administratorem Serwisu jest <strong>Stowarzyszenie Słowem w Twarz</strong> z siedzibą w Rybniku, ul. Dworek 5/33, 44-200 Rybnik, KRS: 0000699712, NIP: 6423204888, REGON: 368529913, adres e-mail: <strong>biuro@slowemwtwarz.pl</strong>, numer telefonu: <strong>+48 575 97 01 31</strong>.</p>
                <p>3. Serwis jest platformą internetową umożliwiającą przekazywanie wsparcia finansowego na rzecz organizacji non-profit oraz inicjatyw charytatywnych poprzez zakup wirtualnych darowizn.</p>
                <p>4. Warunkiem korzystania z Serwisu jest zapoznanie się z Regulaminem i jego akceptacja.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§2. Definicje</h2>
              <div className="ml-4 space-y-2">
                <p>1. <strong>Administrator</strong> – Stowarzyszenie Słowem w Twarz, właściciel i operator Serwisu.</p>
                <p>2. <strong>Użytkownik</strong> – osoba fizyczna, prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Serwisu.</p>
                <p>3. <strong>Organizacja</strong> – podmiot non-profit, który zbiera środki finansowe na swoje cele statutowe za pośrednictwem Serwisu.</p>
                <p>4. <strong>Darowizna</strong> – środki finansowe przekazywane przez Użytkownika na rzecz wybranej Organizacji.</p>
                <p>5. <strong>Operator Płatności</strong> – podmiot realizujący obsługę transakcji finansowych w Serwisie (np. PayU, Przelewy24).</p>
                <p>6. <strong>Serwis</strong> – platforma internetowa <strong>ImpactMarket.pl</strong>, umożliwiająca realizację transakcji finansowych na rzecz Organizacji.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§3. Usługi świadczone w ramach Serwisu</h2>
              <div className="ml-4 space-y-2">
                <p>1. Administrator świadczy usługi umożliwiające Użytkownikom dokonywanie wpłat na rzecz Organizacji za pośrednictwem Serwisu.</p>
                <p>2. Wpłaty mogą być realizowane poprzez: przelew bankowy, kartę płatniczą, BLIK oraz inne metody obsługiwane przez Operatora Płatności.</p>
                <p>3. Użytkownicy mogą przekazywać darowizny jednorazowo lub w formie subskrypcji cyklicznych.</p>
                <p>4. Serwis nie pobiera prowizji od wpłaconych darowizn; możliwe są jednak opłaty operatora płatności.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§4. Procedura rejestracji i korzystania z Serwisu</h2>
              <div className="ml-4 space-y-2">
                <p>1. Korzystanie z Serwisu może odbywać się bez rejestracji lub z rejestracją konta Użytkownika.</p>
                <p>2. Rejestracja w Serwisie wymaga podania podstawowych danych osobowych (imię, nazwisko, e-mail).</p>
                <p>3. Użytkownik może w dowolnym momencie usunąć swoje konto, kontaktując się z Administratorem drogą mailową.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§5. Prawa i obowiązki Użytkownika</h2>
              <div className="ml-4 space-y-2">
                <p>1. Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z obowiązującym prawem i dobrymi obyczajami.</p>
                <p>2. Zabronione jest zamieszczanie w Serwisie treści bezprawnych lub naruszających prawa osób trzecich.</p>
                <p>3. Użytkownik ma prawo zgłaszać Administratorowi wszelkie nieprawidłowości w funkcjonowaniu Serwisu.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§6. Prawa i obowiązki Administratora</h2>
              <div className="ml-4 space-y-2">
                <p>1. Administrator zobowiązuje się do zapewnienia prawidłowego funkcjonowania Serwisu i obsługi transakcji.</p>
                <p>2. Administrator nie ponosi odpowiedzialności za problemy techniczne niezależne od niego.</p>
                <p>3. Administrator może zawiesić lub usunąć konto Użytkownika, który narusza Regulamin.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§7. Polityka zwrotów</h2>
              <div className="ml-4 space-y-2">
                <p>1. Z uwagi na charakter darowizn, wpłacone środki nie podlegają zwrotowi.</p>
                <p>2. W sytuacji omyłkowej wpłaty Użytkownik może skontaktować się z Administratorem w celu indywidualnego rozpatrzenia sprawy.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§8. Reklamacje</h2>
              <div className="ml-4 space-y-2">
                <p>1. Użytkownik może składać reklamacje dotyczące funkcjonowania Serwisu poprzez e-mail na adres: <strong>biuro@slowemwtwarz.pl</strong>.</p>
                <p>2. Administrator zobowiązuje się rozpatrzyć reklamację w terminie 14 dni roboczych.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§9. Ochrona danych osobowych</h2>
              <div className="ml-4 space-y-2">
                <p>1. Administrator przetwarza dane osobowe Użytkowników zgodnie z obowiązującymi przepisami prawa.</p>
                <p>2. Szczegółowe zasady ochrony danych osobowych określa <strong>Polityka Prywatności</strong> dostępna w Serwisie.</p>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-6">§10. Postanowienia końcowe</h2>
              <div className="ml-4 space-y-2">
                <p>1. Regulamin wchodzi w życie z dniem <strong>01 marca 2025 r.</strong></p>
                <p>2. Administrator zastrzega sobie prawo do zmiany Regulaminu. Użytkownicy zostaną poinformowani o zmianach drogą elektroniczną.</p>
                <p>3. W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego.</p>
              </div>

              <div className="mt-8 text-gray-300">
                <p>Jeśli masz pytania dotyczące Regulaminu, skontaktuj się z nami pod adresem: <strong>biuro@slowemwtwarz.pl</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 