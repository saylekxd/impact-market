import React from 'react';
import PageLayout from '../components/PageLayout';

export default function About() {
  return (
    <PageLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">O nas</h1>
          <div className="prose prose-invert">
            <div className="text-gray-300 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">ImpactMarket.pl</h2>
                <p className="text-lg mb-6">
                  Łączymy pasję, technologię i społeczne zaangażowanie. ImpactMarket.pl to platforma, która rewolucjonizuje sposób, w jaki wspieramy twórców, organizacje i inicjatywy społeczne. Powstała z doświadczeń Stowarzyszenia "Słowem w Twarz", które od 2017 roku łączy kulturę, technologię i zaangażowanie młodych ludzi w działania społeczno-kulturalne.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Dlaczego ImpactMarket.pl?</h2>
                <p className="mb-4">
                  Od lat tworzymy nowoczesne rozwiązania dla organizacji pozarządowych, widząc, jak bardzo brakuje im narzędzi dostosowanych do ich unikalnych potrzeb. ImpactMarket.pl to odpowiedź na te wyzwania – platforma łącząca kreatywność, cyfryzację i realny wpływ społeczny.
                </p>
                <p className="mb-2">Dzięki naszym autorskim technologiom:</p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                  <li>
                    <strong>Ułatwiamy finansowanie działań społecznych i kulturalnych</strong> – Twórcy i NGO-sy mogą w prosty sposób otrzymywać wsparcie finansowe od społeczności.
                  </li>
                  <li>
                    <strong>Tworzymy innowacyjne narzędzia</strong> – od dedykowanych aplikacji po interaktywne materiały multimedialne, które zwiększają zaangażowanie odbiorców.
                  </li>
                  <li>
                    <strong>Wspieramy edukację i rozwój młodych liderów</strong> – umożliwiamy twórcom i organizacjom skuteczne zarządzanie swoimi projektami i budowanie społeczności wokół ich działań.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Technologia dla zmiany społecznej</h2>
                <p className="mb-4">
                  Nie jesteśmy zwykłą platformą crowdfundingową. Jako stowarzyszenie technologiczne rozwijamy innowacyjne rozwiązania:
                </p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                  <li>Aplikacje internetowe i webowe dla organizacji pozarządowych.</li>
                  <li>Gry edukacyjne i technologie 3D do angażowania społeczności.</li>
                  <li>Zarządzanie fundraisingiem i darowiznami w prosty, intuicyjny sposób.</li>
                  <li>Interaktywne treści wideo i materiały 360°, które zwiększają zasięg działań społecznych.</li>
                </ul>
              </div>

              <div>
                <p className="text-lg mb-4">
                  ImpactMarket.pl to miejsce, gdzie technologia spotyka się z pasją, a każda darowizna staje się realnym impulsem do zmian. Tworzymy przestrzeń dla ludzi z misją – dla tych, którzy chcą inspirować, działać i rozwijać swoje projekty.
                </p>
                <p className="text-lg font-semibold">
                  Dołącz do nas i buduj przyszłość, w której wsparcie społeczne jest proste, przejrzyste i skuteczne. 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 