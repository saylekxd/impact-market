import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, CircleDollarSign, Building, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface VerificationStatusProps {
  hasBankAccount: boolean;
  kycStatus: string | null;
  onStartKyc?: () => void;
}

export default function VerificationStatus({ hasBankAccount, kycStatus, onStartKyc }: VerificationStatusProps) {
  // Determine if requirements are met for withdrawals
  const isVerified = hasBankAccount && kycStatus === 'verified';
  
  // State to track if the verification details are expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(!isVerified); // Default expanded if not verified
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight text-black">Status weryfikacji</h2>
          <button 
            onClick={toggleExpand} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Overall Status - Always visible */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 rounded-lg ${isVerified ? 'bg-green-50' : 'bg-yellow-50'} mb-4`}
        >
          <div className="flex items-center">
            {isVerified ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-green-800">Gotowe do wypłat</h3>
                  <p className="text-sm text-green-700">
                    Wszystkie wymagania zostały spełnione. Możesz teraz zlecać wypłaty środków.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CircleDollarSign className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">Wymagana weryfikacja</h3>
                  <p className="text-sm text-yellow-700">
                    Wypełnij wszystkie wymagania, aby móc zlecać wypłaty środków.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Detailed verification requirements - Collapsible */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="text-gray-600 mb-6">
              Przed zleceniem wypłaty musisz spełnić następujące wymagania:
            </p>
            
            {/* Bank Account Status */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-start p-4 rounded-lg bg-gray-50"
            >
              <div className="mr-4 mt-0.5">
                {hasBankAccount ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-black flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Dane bankowe
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {hasBankAccount 
                    ? 'Twoje dane bankowe zostały zweryfikowane i są gotowe do użycia.' 
                    : 'Dodaj i zweryfikuj swoje dane bankowe, aby móc zlecać wypłaty.'}
                </p>
                {!hasBankAccount && (
                  <Link 
                    to="/dashboard/withdraws" 
                    className="inline-flex items-center mt-3 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Dodaj dane bankowe
                  </Link>
                )}
              </div>
            </motion.div>
            
            {/* KYC Verification Status */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-start p-4 rounded-lg bg-gray-50"
            >
              <div className="mr-4 mt-0.5">
                {kycStatus === 'verified' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : kycStatus === 'pending' ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-black flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Weryfikacja tożsamości (KYC)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {kycStatus === 'verified' 
                    ? 'Twoja tożsamość została zweryfikowana.' 
                    : kycStatus === 'pending' 
                      ? 'Weryfikacja tożsamości jest w toku. Zostaniesz powiadomiony o wyniku.' 
                      : 'Wymagana jest weryfikacja tożsamości dla wypłat środków.'}
                </p>
                {(kycStatus === 'not_started' || kycStatus === null) && (
                  <button
                    onClick={onStartKyc}
                    className="inline-flex items-center mt-3 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Rozpocznij weryfikację
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 