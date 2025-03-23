import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Building, User, Heart, Paintbrush } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AccountTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`relative p-6 border rounded-lg cursor-pointer transition-colors duration-200 ${
      selected
        ? 'border-[#FF9F2D] bg-[#FF9F2D]/5'
        : 'border-gray-200 hover:border-[#FF9F2D]/50 bg-white/5'
    }`}
    onClick={onClick}
  >
    {selected && (
      <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[#FF9F2D]" />
    )}
    <div className="flex flex-col items-center text-center space-y-3">
      <div className={`p-3 rounded-full ${
        selected ? 'bg-[#FF9F2D]/20 text-[#FF9F2D]' : 'bg-gray-100/10 text-gray-400'
      }`}>
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </motion.div>
);

export interface AccountTypeSelectionProps {
  onCompleted: () => void;
  userId: string;
}

export const AccountTypeSelection: React.FC<AccountTypeSelectionProps> = ({
  onCompleted,
  userId,
}) => {
  const [step, setStep] = useState<'initial' | 'organization'>('initial');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialTypes = [
    {
      id: 'individual',
      title: 'Konto Osobiste',
      description: 'Chcę zarejestrować się jako osoba prywatna',
      icon: <User className="w-6 h-6" />,
    },
    {
      id: 'organization',
      title: 'Organizacja',
      description: 'Reprezentuję firmę, organizację non-profit lub jestem twórcą',
      icon: <Building className="w-6 h-6" />,
    },
  ];

  const organizationTypes = [
    {
      id: 'business',
      title: 'Firma',
      description: 'Dla firm i organizacji komercyjnych',
      icon: <Building className="w-6 h-6" />,
    },
    {
      id: 'nonprofit',
      title: 'Non-Profit',
      description: 'Dla organizacji charytatywnych i non-profit',
      icon: <Heart className="w-6 h-6" />,
    },
    {
      id: 'creator',
      title: 'Twórca',
      description: 'Dla artystów, twórców treści i influencerów',
      icon: <Paintbrush className="w-6 h-6" />,
    },
  ];

  const handleInitialSelection = (type: string) => {
    if (type === 'organization') {
      setStep('organization');
      setSelected(null);
    } else {
      setSelected(type);
    }
  };

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Proszę wybrać typ konta, aby kontynuować');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: selected })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast.success('Typ konta został pomyślnie wybrany');
      onCompleted();
    } catch (error) {
      toast.error('Nie udało się zapisać typu konta');
      console.error('Error saving account type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setSelected(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <p className="mt-2 text-gray-400">
          {step === 'initial' 
            ? 'Wybierz, jak chcesz zarejestrować swoje konto'
            : 'Jaki typ organizacji reprezentujesz?'}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${step === 'initial' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}>
        {step === 'initial'
          ? initialTypes.map((type) => (
              <AccountTypeCard
                key={type.id}
                title={type.title}
                description={type.description}
                icon={type.icon}
                selected={selected === type.id}
                onClick={() => handleInitialSelection(type.id)}
              />
            ))
          : organizationTypes.map((type) => (
              <AccountTypeCard
                key={type.id}
                title={type.title}
                description={type.description}
                icon={type.icon}
                selected={selected === type.id}
                onClick={() => setSelected(type.id)}
              />
            ))}
      </div>

      <div className="flex justify-center space-x-4">
        {step === 'organization' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="px-6 py-3 rounded-md text-white font-medium border border-gray-600 hover:border-gray-500"
          >
            Wstecz
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selected || loading}
          onClick={handleContinue}
          className={`px-8 py-3 rounded-md text-white font-medium transition-colors duration-200 ${
            !selected || loading
              ? 'bg-gray-500/50 cursor-not-allowed'
              : 'bg-[#FF9F2D] hover:bg-[#f39729]'
          }`}
        >
          {loading ? 'Zapisywanie...' : 'Kontynuuj'}
        </motion.button>
      </div>
    </div>
  );
};

export default AccountTypeSelection; 