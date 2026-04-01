import { type FC } from 'react';
import { Image as ImageIcon, Smile } from 'lucide-react';

interface PostInputBoxProps {
  user: any;
  onClick: () => void;
}

const PostInputBox: FC<PostInputBoxProps> = ({ user, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-full bg-white rounded-full border border-gray-100/80 shadow-sm p-2 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow duration-300"
    >
      <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8080${user.avatar_url}`}
            alt="User"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#FF3B8E] font-black text-sm uppercase">
            {user?.username?.charAt(0) || '?'}
          </span>
        )}
      </div>
      
      <div className="flex-1 bg-transparent px-2">
        <span className="text-gray-400 text-sm font-medium select-none">Create a post...</span>
      </div>
      
      <div className="flex items-center gap-2 pr-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-pink-400 hover:bg-pink-50 hover:text-pink-600 transition-colors">
          <ImageIcon className="w-5 h-5" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
          <Smile className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostInputBox;
