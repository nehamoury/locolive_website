import React from 'react';
import { MapPin } from 'lucide-react';

interface DiscoveryHeaderProps {
  activeTab: 'stories' | 'heatmap' | 'both';
  setActiveTab: (tab: 'stories' | 'heatmap' | 'both') => void;
  locationName: string;
}

export const DiscoveryHeader: React.FC<DiscoveryHeaderProps> = ({ activeTab, setActiveTab, locationName }) => {
  return (
    <div className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex flex-col gap-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Discover</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-pink-500" />
          <span className="text-xs font-bold text-gray-600">{locationName || "Detecting..."}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <TabButton 
          label="Stories" 
          active={activeTab === 'stories'} 
          onClick={() => setActiveTab('stories')}
          icon="📸"
        />
        <TabButton 
          label="Heatmap" 
          active={activeTab === 'heatmap'} 
          onClick={() => setActiveTab('heatmap')}
          icon="🔥"
        />
        <TabButton 
          label="Both" 
          active={activeTab === 'both'} 
          onClick={() => setActiveTab('both')}
          icon="✨"
        />
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: string }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-sm
      ${active 
        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-200' 
        : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
  >
    {icon && <span className="text-sm">{icon}</span>}
    {label}
  </button>
);
