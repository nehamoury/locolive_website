import type { FC } from 'react';
import MapView from '../../components/map/MapView';

const MapPage: FC = () => (
  <div className="h-full relative">
    <MapView onStorySelect={(id) => console.log('Selected story:', id)} />
  </div>
);

export { MapPage };
