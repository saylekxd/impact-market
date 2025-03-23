import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Filter, Calendar, ArrowLeft, 
  ArrowRight, Heart, CreditCard as CreditCardIcon 
} from 'lucide-react';
import { Database } from '../../../lib/database.types';
import { dateRanges } from './DateRangeFilter';

type Payment = Database['public']['Tables']['payments']['Row'];

type DonationHistoryProps = {
  payments: Payment[];
  filteredPayments: Payment[];
  dateRangeLabel: string;
  formatCurrency: (amount: number) => string;
  smallCoffeeAmount: number;
  mediumCoffeeAmount: number;
  onSelectPayment: (payment: Payment) => void;
  onDateRangeChange: (rangeValue: string) => void;
};

const DonationHistory: React.FC<DonationHistoryProps> = ({
  payments,
  filteredPayments,
  dateRangeLabel,
  formatCurrency,
  smallCoffeeAmount,
  mediumCoffeeAmount,
  onSelectPayment,
  onDateRangeChange,
}) => {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Payment>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);

  // Filter by amount
  const filterByAmount = (payment: Payment) => {
    if (amountFilter === 'all') return true;
    
    switch (amountFilter) {
      case 'small':
        return payment.amount <= smallCoffeeAmount;
      case 'medium':
        return payment.amount > smallCoffeeAmount && payment.amount <= mediumCoffeeAmount;
      case 'large':
        return payment.amount > mediumCoffeeAmount;
      default:
        return true;
    }
  };
  
  // Search payments
  const searchPayments = (payment: Payment) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (payment.payer_name && payment.payer_name.toLowerCase().includes(query)) ||
      (payment.payer_email && payment.payer_email.toLowerCase().includes(query)) ||
      (payment.message && payment.message.toLowerCase().includes(query))
    );
  };

  // Sort and filter payments
  const filteredAndSearchedPayments = React.useMemo(() => {
    return filteredPayments
      .filter(filterByAmount)
      .filter(searchPayments)
      .sort((a, b) => {
        // Handle special case for string fields
        if (sortField === 'payer_name' || sortField === 'payer_email' || sortField === 'status') {
          const valueA = a[sortField] || '';
          const valueB = b[sortField] || '';
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        // Handle numeric and date fields
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        // Handle null values
        if (valueA === null && valueB === null) return 0;
        if (valueA === null) return sortDirection === 'asc' ? -1 : 1;
        if (valueB === null) return sortDirection === 'asc' ? 1 : -1;
        
        // Sort non-null values
        if (sortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
  }, [filteredPayments, amountFilter, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSearchedPayments.length / paymentsPerPage);
  const paginatedPayments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * paymentsPerPage;
    return filteredAndSearchedPayments.slice(startIndex, startIndex + paymentsPerPage);
  }, [filteredAndSearchedPayments, currentPage, paymentsPerPage]);

  // Handle sort
  const handleSort = (field: keyof Payment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [amountFilter, searchQuery]);

  // Calculate statistics for the filtered data
  const completedPayments = filteredPayments.filter(p => p.status === 'completed');
  const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const averageAmount = completedPayments.length ? totalAmount / completedPayments.length : 0;
  const uniqueDonorsCount = new Set(
    completedPayments
      .map(p => p.payer_email || `anonymous-${p.id}`)
  ).size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <CreditCard className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-bold tracking-tight text-black">Historia darowizn</h2>
          </div>
          
          {/* Advanced Filter Options */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            {/* Date Range Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                value={dateRanges.find(r => r.label === dateRangeLabel)?.value || 'all'}
                onChange={(e) => onDateRangeChange(e.target.value)}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Amount Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              >
                <option value="all">Wszystkie kwoty</option>
                <option value="small">Małe (do {formatCurrency(smallCoffeeAmount)})</option>
                <option value="medium">Średnie (do {formatCurrency(mediumCoffeeAmount)})</option>
                <option value="large">Duże (powyżej {formatCurrency(mediumCoffeeAmount)})</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj darczyńcy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none w-full"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Łącznie</p>
            <p className="text-lg font-semibold text-black">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Liczba darowizn</p>
            <p className="text-lg font-semibold text-black">{completedPayments.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Średnia darowizna</p>
            <p className="text-lg font-semibold text-black">{formatCurrency(averageAmount)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Unikalnych darczyńców</p>
            <p className="text-lg font-semibold text-black">{uniqueDonorsCount}</p>
          </div>
        </div>
      </div>
      
      {/* Payment Table */}
      <div className="overflow-x-auto">
        {filteredAndSearchedPayments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center">
                    Data
                    {sortField === 'created_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('payer_name')}>
                  <div className="flex items-center">
                    Darczyńca
                    {sortField === 'payer_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>
                  <div className="flex items-center">
                    Kwota
                    {sortField === 'amount' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wiadomość
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Szczegóły
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className={payment.status === 'completed' ? '' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('pl-PL')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.payer_name || 'Anonimowy darczyńca'}
                    </div>
                    {payment.payer_email && (
                      <div className="text-xs text-gray-500">
                        {payment.payer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.payment_type || 'Karta płatnicza'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {payment.message ? (
                        <div className="relative group">
                          <div className="truncate max-w-[200px]">{payment.message}</div>
                          {payment.message.length > 30 && (
                            <div className="absolute hidden group-hover:block z-10 bg-gray-800 text-white text-sm rounded-md shadow-lg p-3 max-w-sm mt-1">
                              {payment.message}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Brak wiadomości</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {payment.status === 'completed' ? 'Zakończona' : 
                       payment.status === 'pending' ? 'W trakcie' : 'Anulowana'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onSelectPayment(payment)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      Szczegóły
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Brak darowizn</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? 'Brak darowizn spełniających kryteria wyszukiwania.' 
                : 'Nie znaleziono żadnych darowizn w wybranym okresie.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {filteredAndSearchedPayments.length > paymentsPerPage && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Wyświetlanie <span className="font-medium">{Math.min((currentPage - 1) * paymentsPerPage + 1, filteredAndSearchedPayments.length)}</span> do <span className="font-medium">{Math.min(currentPage * paymentsPerPage, filteredAndSearchedPayments.length)}</span> z <span className="font-medium">{filteredAndSearchedPayments.length}</span> darowizn
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Poprzednia</span>
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Następna</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
          
          <div className="flex sm:hidden justify-between w-full">
            <button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Poprzednia
            </button>
            <button
              onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Następna
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DonationHistory; 