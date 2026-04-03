import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Users, MapPin, Zap, ChevronUp, ChevronDown } from 'lucide-react';

interface MapFiltersProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

export const MapFilters: React.FC<MapFiltersProps> = ({ onFilterChange, activeFilters }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleFilter = (key: string, value: any) => {
    onFilterChange({
      ...activeFilters,
      [key]: activeFilters[key] === value ? null : value
    });
  };

  return (
    <div className="absolute top-24 left-6 z-[600] flex flex-col items-start gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-xl hover:bg-white transition-all group"
      >
        <Filter className={`w-4 h-4 ${isOpen ? 'text-pink-500' : 'text-gray-400 group-hover:text-pink-500 transition-colors'}`} />
        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Filters</span>
        {isOpen ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-[24px] shadow-2xl min-w-[180px]"
          >
            {/* Distance Filter */}
            <div className="px-3 pt-2 pb-1 text-[9px] font-black text-gray-400 uppercase tracking-[2px]">Distance</div>
            <div className="grid grid-cols-3 gap-1 px-1 pb-2">
              {[1, 5, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => toggleFilter('distance', d)}
                  className={`py-2 rounded-xl text-[10px] font-bold transition-all ${
                    activeFilters.distance === d 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {d}km
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-50 mx-2" />

            {/* Online Status */}
            <button
              onClick={() => toggleFilter('isOnline', true)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeFilters.isOnline ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeFilters.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400'}`} />
              <span className="text-xs font-black italic tracking-tight">Active Now</span>
            </button>

            {/* Stories Only */}
            <button
              onClick={() => toggleFilter('hasStories', true)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeFilters.hasStories ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className={`w-4 h-4 ${activeFilters.hasStories ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
              <span className="text-xs font-black italic tracking-tight">Has Stories</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
