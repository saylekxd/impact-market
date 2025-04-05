import React from 'react';
import { FormField } from './FormField';

interface FormData {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  organization_name: string;
  tax_id: string;
  business_type: string;
  nonprofit_id: string;
  mission_statement: string;
  professional_category: string;
  portfolio_url: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface NonprofitFormProps {
  formState: FormData;
  errors: FormErrors;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const NonprofitForm: React.FC<NonprofitFormProps> = ({
  formState,
  errors,
  handleChange,
}) => {
  return (
    <>
      <FormField
        id="organization_name"
        name="organization_name"
        label="Nazwa Organizacji"
        value={formState.organization_name}
        onChange={handleChange}
        error={errors.organization_name}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="nonprofit_id"
          name="nonprofit_id"
          label="Numer KRS"
          value={formState.nonprofit_id}
          onChange={handleChange}
          placeholder="0000000000"
          error={errors.nonprofit_id}
        />
        <FormField
          id="tax_id"
          name="tax_id"
          label="NIP"
          value={formState.tax_id}
          onChange={handleChange}
          placeholder="1234567890"
          error={errors.tax_id}
        />
      </div>

      <FormField
        id="mission_statement"
        name="mission_statement"
        label="Misja Organizacji"
        type="textarea"
        value={formState.mission_statement}
        onChange={handleChange}
        placeholder="Opisz główne cele i misję organizacji..."
        error={errors.mission_statement}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="first_name"
          name="first_name"
          label="Imię Osoby Kontaktowej"
          value={formState.first_name}
          onChange={handleChange}
          error={errors.first_name}
        />
        <FormField
          id="last_name"
          name="last_name"
          label="Nazwisko Osoby Kontaktowej"
          value={formState.last_name}
          onChange={handleChange}
          error={errors.last_name}
        />
      </div>

      <FormField
        id="address"
        name="address"
        label="Adres Organizacji"
        value={formState.address}
        onChange={handleChange}
        placeholder="Ulica i numer"
        error={errors.address}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          id="city"
          name="city"
          label="Miasto"
          value={formState.city}
          onChange={handleChange}
          error={errors.city}
        />
        <FormField
          id="postal_code"
          name="postal_code"
          label="Kod Pocztowy"
          value={formState.postal_code}
          onChange={handleChange}
          placeholder="00-000"
          error={errors.postal_code}
        />
        <FormField
          id="country"
          name="country"
          label="Kraj"
          value={formState.country}
          onChange={handleChange}
          placeholder="Polska"
          error={errors.country}
        />
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-xs font-medium text-gray-300 mb-0.5">
          Telefon Organizacji
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formState.phone_number}
          onChange={handleChange}
          required
          className={`mt-0.5 block w-full rounded-md border-gray-300/20 bg-white/5 text-white text-sm shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] py-1.5 ${
            errors.phone_number ? 'border-red-400' : ''
          }`}
          placeholder="+48 123 456 789"
        />
        {errors.phone_number && (
          <p className="mt-1 text-xs text-red-400">{errors.phone_number}</p>
        )}
      </div>
    </>
  );
};

export default NonprofitForm; 