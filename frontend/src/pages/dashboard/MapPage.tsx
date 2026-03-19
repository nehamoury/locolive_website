import React from 'react';
import { MapView } from '../../components/map/MapView';
import { Marker } from '../../components/map/Marker';
import { StoryBar } from '../../components/story/StoryBar';

const MapPage: React.FC = () => {
  // Mock data for markers
  const markers: { position: [number, number]; title: string; description: string }[] = [
    { position: [28.6139, 77.2090], title: "New Delhi", description: "The capital of India" },
    { position: [19.0760, 72.8777], title: "Mumbai", description: "The financial hub" },
    { position: [12.9716, 77.5946], title: "Bangalore", description: "The Silicon Valley of India" },
  ];

  return (
    <div className="h-full relative flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <StoryBar />
      </div>
      
      <div className="flex-1">
        <MapView zoom={5}>
          {markers.map((marker, idx) => (
            <Marker 
              key={idx} 
              position={marker.position} 
              title={marker.title} 
              description={marker.description} 
            />
          ))}
        </MapView>
      </div>
    </div>
  );
};

export { MapPage };
