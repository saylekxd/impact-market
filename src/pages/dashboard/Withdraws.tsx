import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePayouts } from '../../contexts/PayoutContext';
import { useProfile } from '../../contexts/ProfileContext';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import VerificationStatus from './components/VerificationStatus';
import { verifications } from '../../lib/verifications';
import { toast } from 'react-hot-toast';
import BankAccountForm from '../../components/BankAccountForm';
import { Building, ChevronUp, ChevronDown } from 'lucide-react';

// Import the new components
import WithdrawalSummary from './components/WithdrawalSummary';
import WithdrawalRequestForm from './components/WithdrawalRequestForm';
import WithdrawalHistory from './components/WithdrawalHistory';
import WithdrawalStatistics from './components/WithdrawalStatistics';
import ConfirmationDialog from './components/ConfirmationDialog';

export default function Withdraws() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, loadProfile } = useProfile();
  const { bankAccount, payouts, loading: payoutsLoading, loadBankAccount, loadPayouts, requestPayout } = usePayouts();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [processingKyc, setProcessingKyc] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Determine if all requirements are met for withdrawals
  const isVerified = !!bankAccount && kycStatus === 'verified';
  
  // Calculate financial statistics
  const rawAvailableBalance = profile?.available_balance || 0;
  
  // Calculate total pending withdrawals
  const pendingWithdrawals = payouts?.reduce((sum, payout) => {
    return payout.status === 'pending' ? sum + payout.amount : sum;
  }, 0) || 0;
  
  // Calculate total donations received (from profile)
  const totalDonations = profile?.total_donations || 0;
  
  // Calculate total completed withdrawals
  const totalWithdrawn = payouts?.reduce((sum, payout) => {
    return payout.status === 'completed' ? sum + payout.amount : sum;
  }, 0) || 0;
  
  // Calculate actual available balance
  // This ensures that the balance is correct even if profile.available_balance 
  // hasn't been updated in the database yet after payout status changes
  const calculatedBalance = totalDonations - totalWithdrawn - pendingWithdrawals;
  // Use the smaller of the two values to be safe
  const availableBalance = Math.max(0, Math.min(rawAvailableBalance - pendingWithdrawals, calculatedBalance));
  
  const pendingCount = payouts?.filter(payout => payout.status === 'pending').length || 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };
  
  // State to track if bank account form is expanded
  const [isBankFormExpanded, setIsBankFormExpanded] = useState(!bankAccount);
  
  // Update expand state when bank account data changes
  useEffect(() => {
    // If no bank account, force expanded view
    if (!bankAccount) {
      setIsBankFormExpanded(true);
    }
  }, [bankAccount]);
  
  const toggleBankForm = () => {
    setIsBankFormExpanded(!isBankFormExpanded);
  };
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Load profile data
        await loadProfile();
        
        // Load bank account information
        await loadBankAccount();
        
        // Load payouts history
        await loadPayouts();
        
        // Load KYC verification status
        const verificationResult = await verifications.getStatus(user.id);
        if (verificationResult.success && verificationResult.data) {
          setKycStatus(verificationResult.data.kyc_status);
        } else {
          // If there's no verification data yet, set to 'not_started'
          setKycStatus('not_started');
        }
      } catch (error) {
        console.error('Error loading withdraw data:', error);
        toast.error('Nie udało się załadować danych');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, loadProfile, loadBankAccount, loadPayouts]);
  
  // Function to start the KYC process
  const startKycVerification = async () => {
    if (!user || processingKyc) return;
    
    try {
      setProcessingKyc(true);
      toast.loading('Rozpoczynanie procesu weryfikacji...');
      
      const result = await verifications.initializeKyc(user.id);
      
      toast.dismiss();
      
      if (result.success && result.data) {
        setKycStatus(result.data.kyc_status);
        
        if (result.data.kyc_status === 'pending') {
          toast.success('Proces weryfikacji został rozpoczęty. Status: Oczekujący.');
        } else {
          toast.success('Status weryfikacji został zaktualizowany.');
        }
      } else {
        throw new Error(result.error || 'Nie udało się rozpocząć weryfikacji');
      }
    } catch (error: any) {
      console.error('Error starting KYC verification:', error);
      toast.error(error.message || 'Wystąpił błąd podczas rozpoczynania weryfikacji.');
    } finally {
      setProcessingKyc(false);
    }
  };
  
  // Handle request withdrawal form submission (shows confirmation dialog)
  const handleRequestWithdrawal = (amountInCents: number, amountStr: string, bankAccountId?: string) => {
    setAmount(amountStr);
    setShowConfirmation(true);
  };
  
  // Process the withdrawal after confirmation
  const processWithdrawal = async () => {
    if (!amount || !bankAccount) return;
    
    const amountInCents = Math.floor(Number(amount) * 100);
    
    try {
      setSubmitting(true);
      const success = await requestPayout(amountInCents);
      
      if (success) {
        toast.success('Zlecenie wypłaty zostało utworzone');
        setAmount('');
        setShowConfirmation(false);
        // Reload data to update statistics
        loadProfile();
        loadPayouts();
      } else {
        toast.error('Nie udało się utworzyć zlecenia wypłaty');
      }
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast.error(error.message || 'Wystąpił błąd podczas tworzenia zlecenia wypłaty');
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };
  
  // Cancel the withdrawal confirmation
  const cancelWithdrawal = () => {
    setShowConfirmation(false);
  };
  
  if (loading || payoutsLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-black">Wypłaty</h1>
          <p className="mt-1 text-gray-500">
            Zarządzaj swoimi wypłatami i danymi bankowymi.
          </p>
        </motion.div>
        
        {/* Financial Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <WithdrawalSummary 
            availableBalance={availableBalance}
            totalWithdrawn={totalWithdrawn}
            pendingWithdrawals={pendingWithdrawals}
            pendingCount={pendingCount}
            formatCurrency={formatCurrency}
          />
        </motion.div>
        
        {/* Verification Status Gate - checks if user can request withdrawals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <VerificationStatus 
            hasBankAccount={!!bankAccount} 
            kycStatus={kycStatus}
            onStartKyc={startKycVerification}
          />
        </motion.div>
        
        {/* Bank Account Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Building className="h-6 w-6 text-gray-500 mr-2" />
                <h2 className="text-xl font-bold tracking-tight text-black">Dane bankowe</h2>
              </div>
              {bankAccount && ( // Only show toggle if bank account exists
                <button 
                  onClick={toggleBankForm} 
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={isBankFormExpanded ? "Zwiń" : "Rozwiń"}
                >
                  {isBankFormExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            
            {/* Show a summary when collapsed */}
            {!isBankFormExpanded && bankAccount ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bank:</span> {bankAccount.bank_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Numer konta:</span> ••••{bankAccount.account_number.slice(-4)}
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Podaj dane konta bankowego, na które będą realizowane wypłaty
                </p>
                <BankAccountForm />
              </>
            )}
          </div>
        </motion.div>
        
        {isVerified ? (
          <div className="space-y-8">
            {/* Withdrawal Request Form */}
            <WithdrawalRequestForm 
              bankAccount={bankAccount}
              availableBalance={availableBalance}
              pendingWithdrawals={pendingWithdrawals}
              formatCurrency={formatCurrency}
              onRequestWithdrawal={handleRequestWithdrawal}
            />
            
            {/* Withdrawal History */}
            <WithdrawalHistory 
              payouts={payouts || []} 
              formatCurrency={formatCurrency} 
            />
            
            {/* Withdrawal Statistics */}
            <WithdrawalStatistics 
              payouts={payouts || []}
              totalWithdrawn={totalWithdrawn}
              formatCurrency={formatCurrency}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden p-6"
          >
            <h2 className="text-xl font-bold tracking-tight text-black mb-4">
              Wypłaty niedostępne
            </h2>
            <p className="text-gray-600">
              Aby uzyskać dostęp do funkcji wypłat, musisz najpierw przejść weryfikację oraz dodać dane bankowe.
            </p>
          </motion.div>
        )}
        
        {/* Confirmation Dialog */}
        {showConfirmation && (
          <ConfirmationDialog 
            amount={amount}
            bankAccount={bankAccount}
            submitting={submitting}
            formatCurrency={formatCurrency}
            onConfirm={processWithdrawal}
            onCancel={cancelWithdrawal}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 