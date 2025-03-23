import React from 'react';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder,
  className,
  children,
}) => {
  // Handle different input types
  const renderInput = () => {
    if (children) {
      return children;
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
        />
      );
    }

    if (type === 'select') {
      return null; // Selects should use children prop
    }

    return (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
      />
    );
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default FormField; 