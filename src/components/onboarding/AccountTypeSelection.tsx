import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Building, User, Heart, Paintbrush, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AccountTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  comingSoon: boolean;
}

const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick,
  disabled,
  comingSoon,
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
      disabled: true,
      comingSoon: true,
    },
    {
      id: 'organization',
      title: 'Organizacja',
      description: 'Reprezentuję firmę, organizację non-profit lub jestem twórcą',
      icon: <Building className="w-6 h-6" />,
      disabled: false,
      comingSoon: false,
    },
  ];

  const organizationTypes = [
    {
      id: 'business',
      title: 'Firma',
      description: 'Dla firm i organizacji komercyjnych',
      icon: <Building className="w-6 h-6" />,
      disabled: true,
      comingSoon: true,
    },
    {
      id: 'nonprofit',
      title: 'Non-Profit',
      description: 'Dla organizacji charytatywnych i non-profit',
      icon: <Heart className="w-6 h-6" />,
      disabled: false,
      comingSoon: false,
    },
    {
      id: 'creator',
      title: 'Twórca',
      description: 'Dla artystów, twórców treści i influencerów',
      icon: <Paintbrush className="w-6 h-6" />,
      disabled: true,
      comingSoon: true,
    },
  ];

  const handleInitialSelection = (type: string) => {
    if (type === 'organization') {
      setStep('organization');
      setSelected(null);
    } else {
      if (initialTypes.find(t => t.id === type)?.disabled) {
        return;
      }
      setSelected(type);
    }
  };

  const handleOrganizationSelection = (type: string) => {
    if (organizationTypes.find(t => t.id === type)?.disabled) {
      return;
    }
    setSelected(type);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: selected })
        .eq('id', userId);

      if (error) throw error;

      onCompleted();
    } catch (error) {
      console.error('Error updating account type:', error);
      toast.error('Failed to update account type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 px-3 sm:py-4 sm:px-4 lg:px-8">
      <div className="text-center mb-3 sm:mb-4">
        <p className="text-sm sm:text-base text-gray-400">
          Wybierz typ konta
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm shadow-sm rounded-lg p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {step === 'initial' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {initialTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInitialSelection(type.id)}
                  className={`relative p-4 rounded-lg border border-gray-300/20 text-left transition-colors ${
                    type.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-[#FF9F2D] cursor-pointer'
                  }`}
                >
                  {type.comingSoon && (
                    <span className="absolute top-2 right-2 text-xs text-[#FF9F2D] font-medium">
                      Wkrótce
                    </span>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-300">{type.icon}</div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{type.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {organizationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleOrganizationSelection(type.id)}
                    className={`relative p-4 rounded-lg border transition-colors ${
                      selected === type.id
                        ? 'border-[#FF9F2D]'
                        : 'border-gray-300/20'
                    } ${
                      type.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-[#FF9F2D] cursor-pointer'
                    }`}
                  >
                    {type.comingSoon && (
                      <span className="absolute top-2 right-2 text-xs text-[#FF9F2D] font-medium">
                        Wkrótce
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="text-gray-300">{type.icon}</div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{type.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep('initial')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Wróć
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!selected || loading}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm rounded-md text-white font-medium flex items-center justify-center space-x-2 bg-[#FF9F2D] hover:bg-[#f39729] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{loading ? 'Zapisywanie...' : 'Kontynuuj'}</span>
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelection; 