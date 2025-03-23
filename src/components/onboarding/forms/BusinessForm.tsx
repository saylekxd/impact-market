import React from 'react';
import { FormField } from './FormField';
import { FormData } from '../PersonalDataForm';

interface BusinessFormProps {
  formState: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  formState,
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
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="business_type"
          name="business_type"
          label="Typ Działalności"
          value={formState.business_type}
          onChange={handleChange}
          type="select"
        >
          <select
            id="business_type"
            name="business_type"
            value={formState.business_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
          >
            <option value="">Wybierz typ działalności</option>
            <option value="sole_proprietorship">Jednoosobowa działalność</option>
            <option value="partnership">Spółka cywilna</option>
            <option value="llc">Spółka z o.o.</option>
            <option value="corporation">Spółka akcyjna</option>
            <option value="other">Inna</option>
          </select>
        </FormField>
        <FormField
          id="tax_id"
          name="tax_id"
          label="NIP"
          value={formState.tax_id}
          onChange={handleChange}
          placeholder="np. 1234567890"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          id="first_name"
          name="first_name"
          label="Imię Osoby Kontaktowej"
          value={formState.first_name}
          onChange={handleChange}
        />
        <FormField
          id="last_name"
          name="last_name"
          label="Nazwisko Osoby Kontaktowej"
          value={formState.last_name}
          onChange={handleChange}
        />
      </div>

      <FormField
        id="address"
        name="address"
        label="Adres Firmy"
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
        label="Telefon Firmowy"
        type="tel"
        value={formState.phone_number}
        onChange={handleChange}
        placeholder="+48 123 456 789"
      />
    </>
  );
};

export default BusinessForm; 