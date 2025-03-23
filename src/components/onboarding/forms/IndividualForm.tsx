import React from 'react';
import { FormField } from './FormField';
import { FormData } from '../PersonalDataForm';

interface IndividualFormProps {
  formState: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const IndividualForm: React.FC<IndividualFormProps> = ({
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
        id="address"
        name="address"
        label="Adres"
        value={formState.address}
        onChange={handleChange}
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

export default IndividualForm; 