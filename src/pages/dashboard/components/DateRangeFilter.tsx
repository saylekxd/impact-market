import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
  label: string;
};

export const dateRanges = [
  { label: 'Wszystkie', value: 'all' },
  { label: 'Dzisiaj', value: 'today' },
  { label: 'Ostatnie 7 dni', value: '7days' },
  { label: 'Ostatnie 30 dni', value: '30days' },
  { label: 'Ten miesiąc', value: 'thisMonth' },
  { label: 'Poprzedni miesiąc', value: 'lastMonth' },
  { label: 'Ten rok', value: 'thisYear' }
];

type DateRangeFilterProps = {
  dateRange: DateRange;
  onDateRangeChange: (rangeValue: string) => void;
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onDateRangeChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-orange-500 mr-2" />
          <span className="text-sm font-medium">Filtruj według okresu:</span>
        </div>
        <div className="text-sm text-gray-500">
          {dateRange.startDate && dateRange.endDate ? (
            <span>
              {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
            </span>
          ) : (
            <span>{dateRange.label}</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {dateRanges.map(range => (
          <button
            key={range.value}
            onClick={() => onDateRangeChange(range.value)}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              dateRange.label === range.label 
                ? 'bg-orange-100 text-orange-700 font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default DateRangeFilter; 