import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface Story {
  id: string;
  media_url: string;
  username: string;
  avatar_url?: string;
  caption?: string;
  created_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const story = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // 2% every 100ms = 5s total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black flex items-center justify-center backdrop-blur-3xl">
      <div className="relative w-full max-w-lg h-full max-h-[90vh] md:aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        <img 
          src={`http://localhost:8080${story.media_url}`} 
          className="w-full h-full object-cover" 
          alt="Story" 
        />

        {/* Top Controls & Progress Bars */}
        <div className="absolute top-0 inset-x-0 p-4 space-y-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex space-x-1">
            {stories.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ 
                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-white flex items-center justify-center font-bold text-white">
                {story.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-white">@{story.username}</p>
                <p className="text-[10px] text-gray-300">{new Date(story.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MoreHorizontal className="w-6 h-6 text-white cursor-pointer" />
              <X className="w-8 h-8 text-white cursor-pointer" onClick={onClose} />
            </div>
          </div>
        </div>

        {/* Navigation Areas */}
        <div 
          className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" 
          onClick={handlePrev} 
        />
        <div 
          className="absolute inset-y-0 right-0 w-3/4 cursor-pointer" 
          onClick={handleNext} 
        />

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-10 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm">{story.caption}</p>
          </div>
        )}
      </div>

      {/* Desktop Prev/Next Buttons */}
      <button 
        onClick={handlePrev} 
        className="hidden md:flex absolute left-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-colors disabled:opacity-20"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button 
        onClick={handleNext} 
        className="hidden md:flex absolute right-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-colors shadow-xl"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default StoryViewer;
