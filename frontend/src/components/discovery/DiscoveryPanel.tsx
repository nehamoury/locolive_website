import React from 'react';
import { DiscoveryHeader } from './DiscoveryHeader';
import { PeopleNearbyCard } from './PeopleNearbyCard';
import { PathCrossingsList } from './PathCrossingsList';
import { NearbyStoriesGrid } from './NearbyStoriesGrid';

interface DiscoveryPanelProps {
  activeTab: 'stories' | 'heatmap' | 'both';
  setActiveTab: (tab: 'stories' | 'heatmap' | 'both') => void;
  locationName: string;
  nearbyUser?: any;
  crossings: any[];
  nearbyStories: any[];
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({
  activeTab,
  setActiveTab,
  locationName,
  nearbyUser,
  crossings,
  nearbyStories
}) => {
  return (
    <div className="flex-1 h-full overflow-y-auto no-scrollbar flex flex-col bg-white/50 border-l border-gray-100">
      <DiscoveryHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        locationName={locationName} 
      />

      <div className="p-6 flex flex-col gap-8">
        {/* People Nearby Section */}
        <section className="flex flex-col gap-4">
           <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2 italic uppercase">
              People Nearby 💫
           </h3>
           <PeopleNearbyCard user={nearbyUser || { username: "Guest", bio: "Nearby user", distance: "0.2km" }} />
        </section>

        {/* Path Crossings Section */}
        <PathCrossingsList crossings={crossings} />

        {/* Nearby Stories Grid */}
        <NearbyStoriesGrid stories={nearbyStories} />
      </div>
    </div>
  );
};
