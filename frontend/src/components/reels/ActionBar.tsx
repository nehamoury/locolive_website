import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

interface ActionBarProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  mode?: 'floating' | 'sidebar';
}

const ActionBar: React.FC<ActionBarProps> = ({
  likes,
  comments,
  shares,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  mode = 'floating'
}) => {
  const isFloating = mode === 'floating';

  const ActionButton = ({ icon: Icon, count, active, onClick, activeColor = 'text-primary' }: any) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex ${isFloating ? 'flex-col' : 'flex-row'} items-center gap-1.5 group cursor-pointer`}
    >
      <div className={`
        ${isFloating ? 'w-12 h-12' : 'w-10 h-10'} rounded-full flex items-center justify-center transition-all duration-300
        ${isFloating ? 'bg-black/20 backdrop-blur-md border border-white/10 text-white' : 'bg-zinc-100 text-zinc-500'}
        ${active ? `${activeColor} scale-110 shadow-lg` : 'hover:scale-110'}
        ${isFloating && active ? 'shadow-primary/40' : ''}
      `}>
        <Icon className={`${isFloating ? 'w-6 h-6' : 'w-5 h-5'} ${active ? 'fill-current' : ''}`} />
      </div>
      <span className={`text-[11px] font-black ${isFloating ? 'text-white' : 'text-zinc-500'} drop-shadow-sm`}>
        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    </button>
  );

  if (!isFloating) return null; // In sidebar mode, actions are rendered differently in ReelsSidebar

  return (
    <div className="flex flex-col items-center gap-6">
      <ActionButton 
        icon={Heart} 
        label="Like" 
        count={likes} 
        active={isLiked} 
        onClick={onLike} 
      />
      <ActionButton 
        icon={MessageCircle} 
        label="Comment" 
        count={comments} 
        onClick={onComment} 
      />
      <ActionButton 
        icon={Share2} 
        label="Share" 
        count={shares} 
        onClick={onShare} 
      />
      <ActionButton 
        icon={Bookmark} 
        label="Save" 
        active={isSaved} 
        onClick={onSave} 
        activeColor="text-yellow-500"
      />
    </div>
  );
};

export default ActionBar;
