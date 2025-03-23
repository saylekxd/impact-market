import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export interface PersonalDataFormProps {
  userId: string;
  accountType: string;
  onCompleted: () => void;
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
  userId,
  accountType,
  onCompleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    // Common fields
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    phone_number: '',
    
    // Business/Organization fields
    organization_name: '',
    tax_id: '',
    business_type: '',
    
    // Non-profit fields
    nonprofit_id: '',
    mission_statement: '',
    
    // Creator fields
    professional_category: '',
    portfolio_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const personalData = {
        user_id: userId,
        ...formState,
      };

      const { error } = await supabase.from('personal_data').upsert({
        id: userId,
        ...personalData,
      });

      if (error) throw error;

      toast.success('Personal information saved successfully');
      onCompleted();
    } catch (error) {
      console.error('Error saving personal data:', error);
      toast.error('Failed to save personal information');
    } finally {
      setLoading(false);
    }
  };

  // Load existing data if available
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data, error } = await supabase
          .from('personal_data')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormState((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error('Error fetching personal data:', error);
      }
    };

    fetchExistingData();
  }, [userId]);

  // Render different forms based on account type
  const renderFormFields = () => {
    switch (accountType) {
      case 'individual':
        return renderIndividualFields();
      case 'business':
        return renderBusinessFields();
      case 'nonprofit':
        return renderNonprofitFields();
      case 'creator':
        return renderCreatorFields();
      default:
        return renderIndividualFields();
    }
  };

  const renderIndividualFields = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-300">
            Imię
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formState.first_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-300">
            Nazwisko
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formState.last_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="professional_category" className="block text-xs sm:text-sm font-medium text-gray-300">
          Kategoria wsparcia
        </label>
        <select
          id="professional_category"
          name="professional_category"
          value={formState.professional_category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        >
          <option value="">Wybierz kategorię...</option>
          <option value="humanitarian">Pomoc humanitarna</option>
          <option value="food">Żywność/Gastronomia</option>
          <option value="medical">Medycyna/Zdrowie</option>
          <option value="ecology">Ekologia</option>
          <option value="nature">Ochrona przyrody</option>
          <option value="animals">Ochrona zwierząt</option>
          <option value="education">Edukacja</option>
          <option value="online_learning">Edukacja online</option>
          <option value="pet_help">Pomoc dla zwierząt</option>
          <option value="arts">Kultura i sztuka</option>
          <option value="communication">Komunikacja</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Ta kategoria pomoże nam dopasować odpowiednie ikony do Twojego profilu
        </p>
      </div>

      <div>
        <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-300">
          Adres
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formState.address}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-300">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formState.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kod Pocztowy
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formState.postal_code}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kraj
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formState.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-300">
          Numer Telefonu
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formState.phone_number}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          placeholder="+48 123 456 789"
        />
      </div>
    </>
  );

  const renderBusinessFields = () => (
    <>
      <div>
        <label htmlFor="organization_name" className="block text-xs sm:text-sm font-medium text-gray-300">
          Nazwa Organizacji
        </label>
        <input
          type="text"
          id="organization_name"
          name="organization_name"
          value={formState.organization_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="business_type" className="block text-xs sm:text-sm font-medium text-gray-300">
            Typ Działalności
          </label>
          <input
            type="text"
            id="business_type"
            name="business_type"
            value={formState.business_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="tax_id" className="block text-xs sm:text-sm font-medium text-gray-300">
            NIP
          </label>
          <input
            type="text"
            id="tax_id"
            name="tax_id"
            value={formState.tax_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="professional_category" className="block text-xs sm:text-sm font-medium text-gray-300">
          Kategoria wsparcia
        </label>
        <select
          id="professional_category"
          name="professional_category"
          value={formState.professional_category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        >
          <option value="">Wybierz kategorię...</option>
          <option value="humanitarian">Pomoc humanitarna</option>
          <option value="food">Żywność/Gastronomia</option>
          <option value="medical">Medycyna/Zdrowie</option>
          <option value="ecology">Ekologia</option>
          <option value="nature">Ochrona przyrody</option>
          <option value="animals">Ochrona zwierząt</option>
          <option value="education">Edukacja</option>
          <option value="online_learning">Edukacja online</option>
          <option value="pet_help">Pomoc dla zwierząt</option>
          <option value="arts">Kultura i sztuka</option>
          <option value="communication">Komunikacja</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Ta kategoria pomoże nam dopasować odpowiednie ikony do Twojego profilu
        </p>
      </div>

      <div>
        <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-300">
          Adres Firmy
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formState.address}
          onChange={handleChange}
          required
          placeholder="Ulica i numer"
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-300">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formState.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kod Pocztowy
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formState.postal_code}
            onChange={handleChange}
            required
            placeholder="00-000"
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kraj
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formState.country}
            onChange={handleChange}
            required
            placeholder="Polska"
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-300">
          Telefon Firmowy
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formState.phone_number}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          placeholder="+48 123 456 789"
        />
      </div>
    </>
  );

  const renderNonprofitFields = () => (
    <div className="space-y-2 sm:space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label htmlFor="organization_name" className="block text-xs font-medium text-gray-300 mb-0.5">
            Nazwa Organizacji
          </label>
          <input
            type="text"
            id="organization_name"
            name="organization_name"
            value={formState.organization_name}
            onChange={handleChange}
            required
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>

        <div>
          <label htmlFor="business_type" className="block text-xs font-medium text-gray-300 mb-0.5">
            Typ Organizacji
          </label>
          <select
            id="business_type"
            name="business_type"
            value={formState.business_type}
            onChange={handleChange}
            required
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          >
            <option value="">Wybierz typ...</option>
            <option value="llc_nonprofit">Spółka z o.o. non profit</option>
            <option value="association">Stowarzyszenie</option>
            <option value="foundation">Fundacja</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label htmlFor="nonprofit_id" className="block text-xs font-medium text-gray-300 mb-0.5">
            Numer KRS
          </label>
          <input
            type="text"
            id="nonprofit_id"
            name="nonprofit_id"
            value={formState.nonprofit_id}
            onChange={handleChange}
            required
            placeholder="0000000000"
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-xs font-medium text-gray-300 mb-0.5">
            Telefon
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formState.phone_number}
            onChange={handleChange}
            required
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
            placeholder="+48 123 456 789"
          />
        </div>
      </div>

      <div>
        <label htmlFor="mission_statement" className="block text-xs font-medium text-gray-300 mb-0.5">
          Misja
        </label>
        <textarea
          id="mission_statement"
          name="mission_statement"
          rows={2}
          value={formState.mission_statement}
          onChange={handleChange}
          placeholder="Opisz główne cele i misję organizacji..."
          className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5 resize-none"
        />
      </div>

      <div>
        <label htmlFor="professional_category" className="block text-xs font-medium text-gray-300 mb-0.5">
          Kategoria wsparcia
        </label>
        <select
          id="professional_category"
          name="professional_category"
          value={formState.professional_category}
          onChange={handleChange}
          required
          className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
        >
          <option value="">Wybierz kategorię...</option>
          <option value="humanitarian">Pomoc humanitarna</option>
          <option value="food">Żywność/Gastronomia</option>
          <option value="medical">Medycyna/Zdrowie</option>
          <option value="ecology">Ekologia</option>
          <option value="nature">Ochrona przyrody</option>
          <option value="animals">Ochrona zwierząt</option>
          <option value="education">Edukacja</option>
          <option value="online_learning">Edukacja online</option>
          <option value="pet_help">Pomoc dla zwierząt</option>
          <option value="arts">Kultura i sztuka</option>
          <option value="communication">Komunikacja</option>
        </select>
        <p className="mt-0.5 text-xs text-gray-400">
          Ta kategoria pomoże nam dopasować odpowiednie ikony do Twojego profilu
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        <div>
          <label htmlFor="address" className="block text-xs font-medium text-gray-300 mb-0.5">
            Adres
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formState.address}
            onChange={handleChange}
            required
            placeholder="Ulica i numer"
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div>
          <label htmlFor="city" className="block text-xs font-medium text-gray-300 mb-0.5">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formState.city}
            onChange={handleChange}
            required
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-xs font-medium text-gray-300 mb-0.5">
            Kod
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formState.postal_code}
            onChange={handleChange}
            required
            placeholder="00-000"
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="country" className="block text-xs font-medium text-gray-300 mb-0.5">
            Kraj
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formState.country}
            onChange={handleChange}
            required
            placeholder="Polska"
            className="mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5"
          />
        </div>
      </div>
    </div>
  );

  const renderCreatorFields = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-300">
            Imię
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formState.first_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-300">
            Nazwisko
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formState.last_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="professional_category" className="block text-xs sm:text-sm font-medium text-gray-300">
          Kategoria wsparcia
        </label>
        <select
          id="professional_category"
          name="professional_category"
          value={formState.professional_category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        >
          <option value="">Wybierz kategorię...</option>
          <option value="humanitarian">Pomoc humanitarna</option>
          <option value="food">Żywność/Gastronomia</option>
          <option value="medical">Medycyna/Zdrowie</option>
          <option value="ecology">Ekologia</option>
          <option value="nature">Ochrona przyrody</option>
          <option value="animals">Ochrona zwierząt</option>
          <option value="education">Edukacja</option>
          <option value="online_learning">Edukacja online</option>
          <option value="pet_help">Pomoc dla zwierząt</option>
          <option value="arts">Kultura i sztuka</option>
          <option value="communication">Komunikacja</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Ta kategoria pomoże nam dopasować odpowiednie ikony do Twojego profilu
        </p>
      </div>

      <div>
        <label htmlFor="portfolio_url" className="block text-xs sm:text-sm font-medium text-gray-300">
          Adres portfolio/strony (opcjonalnie)
        </label>
        <input
          type="url"
          id="portfolio_url"
          name="portfolio_url"
          value={formState.portfolio_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-300">
          Adres
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formState.address}
          onChange={handleChange}
          required
          placeholder="Ulica i numer"
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-300">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formState.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kod Pocztowy
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formState.postal_code}
            onChange={handleChange}
            required
            placeholder="00-000"
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="country" className="block text-xs sm:text-sm font-medium text-gray-300">
            Kraj
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formState.country}
            onChange={handleChange}
            required
            placeholder="Polska"
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-300">
          Numer Telefonu
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formState.phone_number}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D]"
          placeholder="+48 123 456 789"
        />
      </div>
    </>
  );

  return (
    <div className="max-w-3xl mx-auto py-2 px-3 sm:py-4 sm:px-4 lg:px-8">
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-sm sm:text-base text-gray-400">
          Podaj swoje {accountType !== 'individual' ? 'dane organizacji' : 'dane osobowe'}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm shadow-sm rounded-lg p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {renderFormFields()}

          <div className="flex justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-md text-white font-medium flex items-center justify-center space-x-2 bg-[#FF9F2D] hover:bg-[#f39729] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
              <span>{loading ? 'Zapisywanie...' : 'Zapisz i Kontynuuj'}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalDataForm; 