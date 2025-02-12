import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Coffee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { profiles } from '../lib/profiles';
import { donations } from '../lib/donations';
import type { Profile } from '../lib/profiles';

const PREDEFINED_AMOUNTS = [
  { value: 500, label: '5 zł' },
  { value: 1000, label: '10 zł' },
  { value: 1500, label: '15 zł' },
];

export default function CreatorProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  
  // Stan formularza płatności
  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // 10 zł domyślnie
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [addMessage, setAddMessage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'blik' | 'card' | 'gpay' | 'online' | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;

      const result = await profiles.getByUsername(username);
      if (result.success && result.data) {
        setProfile(result.data);
        const totalResult = await donations.getTotalByCreatorId(result.data.id);
        if (totalResult.success) {
          setTotalDonations(totalResult.total || 0);
        }
      } else {
        toast.error(result.error || 'Nie znaleziono profilu');
      }
    }

    loadProfile();
  }, [username]);

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !paymentMethod) {
      toast.error('Wybierz metodę płatności');
      return;
    }

    const amount = customAmount ? parseInt(customAmount) * 100 : selectedAmount;
    if (amount < 100) {
      toast.error('Minimalna kwota to 1 zł');
      return;
    }

    setLoading(true);
    try {
      const result = await donations.create({
        creator_id: profile.id,
        amount,
        currency: 'PLN',
        message: addMessage ? message : null,
        payer_name: payerName || null,
        payer_email: payerEmail || null,
      });

      if (result.success && result.redirectUrl) {
        // Przekieruj do bramki płatności
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Wystąpił błąd podczas przetwarzania płatności');
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Ładowanie profilu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Profil twórcy */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {profile.display_name?.[0]}
                    </span>
                  </div>
                )}
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Łączne wsparcie: {(totalDonations / 100).toFixed(2)} PLN
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="mt-4 text-gray-600">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Formularz wsparcia */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Postaw kawę za</h2>
              
              {/* Wybór kwoty */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {PREDEFINED_AMOUNTS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedAmount(value);
                      setCustomAmount('');
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                      selectedAmount === value && !customAmount
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-500'
                    }`}
                  >
                    <Coffee className={`w-6 h-6 ${
                      selectedAmount === value && !customAmount ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className={`mt-2 font-medium ${
                      selectedAmount === value && !customAmount ? 'text-green-500' : 'text-gray-600'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-center text-sm text-gray-500 mb-2">lub</p>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Własna kwota"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500">PLN</span>
                  </div>
                </div>
              </div>

              {/* Dane wspierającego */}
              <form onSubmit={handleDonation} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Imię
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Opcjonalnie"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adres e-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Opcjonalnie"
                    />
                  </div>
                </div>

                {/* Przełącznik wiadomości */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setAddMessage(!addMessage)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      addMessage ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        addMessage ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-gray-600">
                    Chcę dodać dedykację
                  </span>
                </div>

                {/* Pole wiadomości */}
                {addMessage && (
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Twoja wiadomość
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Napisz coś miłego..."
                    />
                  </div>
                )}

                {/* Zgoda marketingowa */}
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="marketing"
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>
                  <label htmlFor="marketing" className="ml-3 text-sm text-gray-500">
                    Zgoda na przetwarzanie danych osobowych w celach marketingowych.
                  </label>
                </div>

                {/* Metody płatności */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Wybierz formę płatności
                  </p>
                  <div className="space-y-3">
                    {/* BLIK */}
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'blik'}
                          onChange={() => setPaymentMethod('blik')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">Blik</span>
                      </div>
                      <img src="https://www.blik.com/static/images/logo-blik.png" alt="BLIK" className="h-6" />
                    </label>

                    {/* Karta płatnicza */}
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">Karta płatnicza</span>
                      </div>
                      <img src="https://www.przelewy24.pl/themes/przelewy24/assets/img/logo-przelewy24.svg" alt="Przelewy24" className="h-6" />
                    </label>

                    {/* Google Pay/Apple Pay */}
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'gpay'}
                          onChange={() => setPaymentMethod('gpay')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">Google Pay/Apple Pay</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <img src="https://developers.google.com/static/pay/api/images/brand-guidelines/google-pay-mark.png" alt="Google Pay" className="h-6" />
                        <img src="https://developer.apple.com/assets/elements/badges/apple-pay-mark.svg" alt="Apple Pay" className="h-6" />
                      </div>
                    </label>

                    {/* Przelew online */}
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">Płatność online</span>
                      </div>
                      <img src="https://www.przelewy24.pl/themes/przelewy24/assets/img/logo-przelewy24.svg" alt="Przelewy24" className="h-6" />
                    </label>
                  </div>
                </div>

                {/* Przycisk płatności */}
                <button
                  type="submit"
                  disabled={loading || !paymentMethod}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {loading ? 'Przetwarzanie...' : `Wesprzyj ${
                    customAmount ? parseFloat(customAmount).toFixed(2) : (selectedAmount / 100).toFixed(2)
                  } PLN`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}