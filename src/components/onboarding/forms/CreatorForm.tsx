import React from 'react';
import { FormField } from './FormField';
import { FormData } from '../PersonalDataForm';

interface CreatorFormProps {
  formState: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const CreatorForm: React.FC<CreatorFormProps> = ({
  formState,
  handleChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="first_name"
          name="first_name"
          label="Imię"
          value={formState.first_name}
          onChange={handleChange}
        />
        <FormField
          id="last_name"
          name="last_name"
          label="Nazwisko"
          value={formState.last_name}
          onChange={handleChange}
        />
      </div>

      <FormField
        id="professional_category"
        name="professional_category"
        label="Kategoria Zawodowa"
        value={formState.professional_category}
        onChange={handleChange}
        type="select"
      >
        <select
          id="professional_category"
          name="professional_category"
          value={formState.professional_category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
        >
          <option value="">Wybierz kategorię</option>
          <option value="visual_artist">Artysta wizualny</option>
          <option value="musician">Muzyk</option>
          <option value="writer">Pisarz/Autor</option>
          <option value="podcaster">Podcaster</option>
          <option value="videographer">Twórca wideo</option>
          <option value="streamer">Streamer</option>
          <option value="influencer">Influencer</option>
          <option value="educator">Edukator/Nauczyciel</option>
          <option value="developer">Programista</option>
          <option value="other">Inne</option>
        </select>
      </FormField>

      <FormField
        id="portfolio_url"
        name="portfolio_url"
        label="Adres Strony Portfolio"
        type="url"
        value={formState.portfolio_url}
        onChange={handleChange}
        placeholder="https://twoje-portfolio.pl"
      />

      <FormField
        id="address"
        name="address"
        label="Adres"
        value={formState.address}
        onChange={handleChange}
        placeholder="Ulica i numer"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          id="city"
          name="city"
          label="Miasto"
          value={formState.city}
          onChange={handleChange}
        />
        <FormField
          id="postal_code"
          name="postal_code"
          label="Kod Pocztowy"
          value={formState.postal_code}
          onChange={handleChange}
          placeholder="00-000"
        />
        <FormField
          id="country"
          name="country"
          label="Kraj"
          value={formState.country}
          onChange={handleChange}
          placeholder="Polska"
        />
      </div>

      <FormField
        id="phone_number"
        name="phone_number"
        label="Numer Telefonu"
        type="tel"
        value={formState.phone_number}
        onChange={handleChange}
        placeholder="+48 123 456 789"
      />
    </>
  );
};

export default CreatorForm; 