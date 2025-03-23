import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { DateRange, dateRanges } from '../pages/dashboard/components/DateRangeFilter';
import { Database } from '../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

type TopDonor = {
  payer_name: string | null;
  payer_email: string | null;
  total_amount: number;
  donation_count: number;
};

type DonorVisibilitySettings = {
  id?: string;
  user_id: string;
  show_top_donors: boolean;
  top_donors_count: number;
  created_at?: string;
  updated_at?: string;
  hide_anonymous: boolean;
};

type DonationsHookResult = {
  payments: Payment[];
  topDonors: TopDonor[];
  donorVisibilitySettings: DonorVisibilitySettings | null;
  anonymousDonations: { total: number; count: number };
  filteredPayments: Payment[];
  stats: {
    uniqueDonors: number;
    totalAmount: number;
    lastMonthAmount: number;
    totalCount: number;
  };
  loading: boolean;
  dateRange: DateRange;
  handleDateRangeChange: (rangeValue: string) => void;
  formatCurrency: (amount: number) => string;
  loadPaymentsAndTopDonors: () => Promise<void>;
  isPaymentInDateRange: (payment: Payment) => boolean;
};

export const useDonations = (userId: string | undefined): DonationsHookResult => {
  console.log('useDonations hook initialized with userId:', userId);
  
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [donorVisibilitySettings, setDonorVisibilitySettings] = useState<DonorVisibilitySettings | null>(null);
  const [anonymousDonations, setAnonymousDonations] = useState<{ total: number; count: number }>({ total: 0, count: 0 });
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    label: 'Wszystkie'
  });
  
  // Add reload tracking to prevent infinite loops
  const reloadCount = useRef(0);
  const dataLoaded = useRef(false);
  
  const [stats, setStats] = useState({
    uniqueDonors: 0,
    totalAmount: 0,
    lastMonthAmount: 0,
    totalCount: 0
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  // Check if payment is within selected date range
  const isPaymentInDateRange = (payment: Payment) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    
    const paymentDate = new Date(payment.created_at);
    
    if (dateRange.startDate && paymentDate < dateRange.startDate) return false;
    if (dateRange.endDate && paymentDate > dateRange.endDate) return false;
    
    return true;
  };

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    return payments.filter(isPaymentInDateRange);
  }, [payments, dateRange]);

  // Manually calculate top donors if the RPC function fails
  const calculateTopDonors = (paymentsData: Payment[]): TopDonor[] => {
    console.log('Calculating top donors manually');
    
    // Get completed payments only
    const completedPayments = paymentsData.filter(p => p.status === 'completed');
    
    // Group by donor (either by name or email)
    const donorMap = new Map<string, TopDonor>();
    
    completedPayments.forEach(payment => {
      const key = payment.payer_email || 
                  (payment.payer_name ? payment.payer_name : `anonymous-${payment.id}`);
      
      if (donorMap.has(key)) {
        const donor = donorMap.get(key)!;
        donor.total_amount += payment.amount;
        donor.donation_count += 1;
      } else {
        donorMap.set(key, {
          payer_name: payment.payer_name,
          payer_email: payment.payer_email,
          total_amount: payment.amount,
          donation_count: 1
        });
      }
    });
    
    // Convert map to array and sort by total amount
    return Array.from(donorMap.values())
      .sort((a, b) => b.total_amount - a.total_amount);
  };

  // Load payments and top donors
  const loadPaymentsAndTopDonors = async () => {
    if (!userId) {
      console.log('No userId provided, skipping data load');
      setLoading(false);
      return;
    }
    
    // Prevent excessive reloading
    if (reloadCount.current > 2) {
      console.log('Too many reload attempts, stopping to prevent infinite loop');
      setLoading(false);
      return;
    }
    
    reloadCount.current += 1;
    
    try {
      setLoading(true);
      console.log('Loading data for userId:', userId);
      
      // Load payments history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
        throw paymentsError;
      }
      
      const safePaymentsData = paymentsData || [];
      console.log('Payments data loaded:', safePaymentsData.length, 'records');
      setPayments(safePaymentsData);
      
      // Set data loaded flag to prevent unnecessary reloading
      dataLoaded.current = true;

      // Try to load top donors via RPC first
      try {
        console.log('Attempting to load top donors via RPC');
        const { data: topDonorsData, error: topDonorsError } = await supabase
          .rpc('get_top_donors', { creator_id: userId });
  
        if (topDonorsError) {
          console.error('Error loading top donors via RPC:', topDonorsError);
          // Fall back to manual calculation
          throw topDonorsError;
        }
        
        console.log('Top donors loaded successfully via RPC:', topDonorsData?.length || 0, 'records');
        
        // Process top donors data
        const anonymousDonor = topDonorsData?.find((donor: TopDonor) => donor.payer_name === 'Anonim');
        const filteredDonors = topDonorsData?.filter((donor: TopDonor) => donor.payer_name !== 'Anonim') || [];
        
        setTopDonors(filteredDonors);
        
        if (anonymousDonor) {
          console.log('Anonymous donations found:', anonymousDonor);
          setAnonymousDonations({
            total: anonymousDonor.total_amount,
            count: anonymousDonor.donation_count
          });
        } else {
          setAnonymousDonations({ total: 0, count: 0 });
        }
      } catch (rpcError) {
        // Fall back to manual calculation
        console.log('Falling back to manual top donors calculation');
        const calculatedTopDonors = calculateTopDonors(safePaymentsData);
        console.log('Manually calculated top donors:', calculatedTopDonors.length, 'records');
        
        // Find anonymous donors (no name and no email)
        const anonymousDonations = safePaymentsData.filter(p => 
          !p.payer_name && !p.payer_email && p.status === 'completed'
        );
        
        const anonymousTotal = anonymousDonations.reduce((sum, p) => sum + p.amount, 0);
        
        setTopDonors(calculatedTopDonors.filter(d => d.payer_name || d.payer_email));
        setAnonymousDonations({
          total: anonymousTotal,
          count: anonymousDonations.length
        });
      }

      // Calculate statistics
      const uniqueDonorsCount = new Set(
        safePaymentsData
          .filter(p => p.status === 'completed')
          .map(p => p.payer_email || `anonymous-${p.id}`)
      ).size;
      
      const completedPayments = safePaymentsData.filter(p => p.status === 'completed');
      const totalPaymentsAmount = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthPayments = completedPayments.filter(payment => new Date(payment.created_at) >= lastMonth);
      const lastMonthAmount = lastMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      console.log('Stats calculated:', {
        uniqueDonors: uniqueDonorsCount,
        totalAmount: totalPaymentsAmount,
        lastMonthAmount: lastMonthAmount,
        totalCount: completedPayments.length
      });

      setStats({
        uniqueDonors: uniqueDonorsCount,
        totalAmount: totalPaymentsAmount,
        lastMonthAmount: lastMonthAmount,
        totalCount: completedPayments.length
      });

      // Try to load donor visibility settings
      try {
        // Create default settings if not exists
        const { data: settingsData, error: settingsError } = await supabase
          .from('donor_visibility')
          .select('*')
          .eq('user_id', userId);
  
        if (settingsError) {
          console.error('Error loading visibility settings:', settingsError);
          // Try to create default settings
          try {
            console.log('Creating default donor visibility settings');
            const { data: newSettings, error: createError } = await supabase
              .from('donor_visibility')
              .insert([
                { 
                  user_id: userId,
                  show_top_donors: true,
                  top_donors_count: 5,
                  hide_anonymous: false
                }
              ])
              .select('*')
              .single();
              
            if (createError) {
              console.error('Failed to create default settings:', createError);
              // Use default settings in memory
              setDonorVisibilitySettings({
                user_id: userId,
                show_top_donors: true,
                top_donors_count: 5,
                hide_anonymous: false
              });
            } else {
              console.log('Default settings created:', newSettings);
              setDonorVisibilitySettings(newSettings);
            }
          } catch (createSettingsError) {
            console.error('Error creating default settings:', createSettingsError);
            // Use default settings
            setDonorVisibilitySettings({
              user_id: userId,
              show_top_donors: true,
              top_donors_count: 5,
              hide_anonymous: false
            });
          }
        } else if (settingsData && settingsData.length > 0) {
          console.log('Donor visibility settings loaded:', settingsData[0]);
          setDonorVisibilitySettings(settingsData[0]);
        } else {
          // No settings found, create default
          try {
            console.log('Creating default donor visibility settings - no data found');
            const { data: newSettings, error: createError } = await supabase
              .from('donor_visibility')
              .insert([
                { 
                  user_id: userId,
                  show_top_donors: true,
                  top_donors_count: 5,
                  hide_anonymous: false
                }
              ])
              .select('*')
              .single();
              
            if (createError) {
              console.error('Failed to create default settings:', createError);
              setDonorVisibilitySettings({
                user_id: userId,
                show_top_donors: true,
                top_donors_count: 5,
                hide_anonymous: false
              });
            } else {
              console.log('Default settings created:', newSettings);
              setDonorVisibilitySettings(newSettings);
            }
          } catch (createSettingsError) {
            console.error('Error creating default settings:', createSettingsError);
            setDonorVisibilitySettings({
              user_id: userId,
              show_top_donors: true,
              top_donors_count: 5,
              hide_anonymous: false
            });
          }
        }
      } catch (settingsError) {
        console.error('Failed to load donor visibility settings:', settingsError);
        // Use default settings
        setDonorVisibilitySettings({
          user_id: userId,
          show_top_donors: true,
          top_donors_count: 5,
          hide_anonymous: false
        });
      }
    } catch (error) {
      console.error('Error loading donations data:', error);
      toast.error('Nie udało się załadować danych');
      
      // Set empty values to avoid null reference errors
      setPayments([]);
      setTopDonors([]);
      setAnonymousDonations({ total: 0, count: 0 });
      setStats({
        uniqueDonors: 0,
        totalAmount: 0,
        lastMonthAmount: 0,
        totalCount: 0
      });
      
      // Mark as loaded to prevent infinite reloading
      dataLoaded.current = true;
    } finally {
      setLoading(false);
      console.log('Data loading completed');
    }
  };

  // Function to update date range
  const handleDateRangeChange = (rangeValue: string) => {
    console.log('Date range changing to:', rangeValue);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    let label = 'Własny zakres';
    
    switch (rangeValue) {
      case 'all':
        // No date filtering
        label = 'Wszystkie';
        break;
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = now;
        label = 'Dzisiaj';
        break;
      case '7days':
        start = new Date();
        start.setDate(now.getDate() - 7);
        end = now;
        label = 'Ostatnie 7 dni';
        break;
      case '30days':
        start = new Date();
        start.setDate(now.getDate() - 30);
        end = now;
        label = 'Ostatnie 30 dni';
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        label = 'Ten miesiąc';
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        label = 'Poprzedni miesiąc';
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        label = 'Ten rok';
        break;
    }
    
    console.log('New date range:', { start, end, label });
    setDateRange({ startDate: start, endDate: end, label });
  };

  // Initial load
  useEffect(() => {
    console.log('Initial data load triggered for userId:', userId);
    if (userId) {
      loadPaymentsAndTopDonors();
    }
  }, [userId]);

  // Modified reload logic to prevent infinite loops
  useEffect(() => {
    if (userId && !loading && !payments.length && !dataLoaded.current) {
      console.log('No payments data found, triggering data reload');
      loadPaymentsAndTopDonors();
    }
  }, [userId, loading, payments.length]);

  useEffect(() => {
    // Log current state when it changes
    console.log('Current hook state:', {
      paymentsLength: payments?.length || 0,
      topDonorsLength: topDonors?.length || 0,
      filteredPaymentsLength: filteredPayments?.length || 0,
      stats,
      loading
    });
  }, [payments, topDonors, filteredPayments, stats, loading]);

  return {
    payments,
    topDonors,
    donorVisibilitySettings,
    anonymousDonations,
    filteredPayments,
    stats,
    loading,
    dateRange,
    handleDateRangeChange,
    formatCurrency,
    loadPaymentsAndTopDonors,
    isPaymentInDateRange,
  };
}; 