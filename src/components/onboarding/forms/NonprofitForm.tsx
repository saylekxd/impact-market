import React from 'react';
import { FormField } from './FormField';
import { FormData } from '../PersonalDataForm';

interface NonprofitFormProps {
  formState: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const NonprofitForm: React.FC<NonprofitFormProps> = ({
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

      <FormField
        id="nonprofit_id"
        name="nonprofit_id"
        label="Numer KRS"
        value={formState.nonprofit_id}
        onChange={handleChange}
        placeholder="0000000000"
      />

      <FormField
        id="mission_statement"
        name="mission_statement"
        label="Misja Organizacji"
        type="textarea"
        value={formState.mission_statement}
        onChange={handleChange}
        placeholder="Opisz główne cele i misję organizacji..."
      />

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
        label="Adres Organizacji"
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
        label="Telefon Organizacji"
        type="tel"
        value={formState.phone_number}
        onChange={handleChange}
        placeholder="+48 123 456 789"
      />
    </>
  );
};

export default NonprofitForm; 