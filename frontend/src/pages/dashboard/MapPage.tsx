import { useState, useEffect, type FC } from 'react';
import MapView from '../../components/map/MapView';
import { StoryBar } from '../../components/story/StoryBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MapPage: FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/feed', { params: { latitude: 28.6139, longitude: 77.2090 } });
        setStories(res.data?.stories || res.data || []);
      } catch (err) {
        console.error('Failed to fetch stories for map:', err);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="h-full relative flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <StoryBar 
          stories={stories} 
          user={user} 
          onCreateStory={() => {}} 
          onStoryClick={(idx: number) => console.log('Story click:', idx)} 
        />
      </div>
      
      <div className="flex-1">
        <MapView onStorySelect={(id) => console.log('Selected story:', id)} />
      </div>
    </div>
  );
};

export { MapPage };
