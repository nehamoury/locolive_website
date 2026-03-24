import { useState, useEffect, type FC } from 'react';
import { ArrowLeft, MessageSquare, UserPlus, MapPin, Grid3x3, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import StoryViewer from '../../components/story/StoryViewer';

interface UserProfileViewProps {
  userId: string;
  onBack: () => void;
  onMessage: (userId: string) => void;
}

const UserProfileView: FC<UserProfileViewProps> = ({ userId, onBack, onMessage }) => {
  const [profile, setProfile] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStories = async () => {
      try {
        const res = await api.get(`/stories/user/${userId}`);
        setStories(res.data || []);
      } catch (err) {
        // We expect 404 if user has no active stories, or other structural errors
        console.log('User has no active stories or fetch failed:', err);
        setStories([]);
      }
    };

    setLoading(true);
    fetchProfile();
    fetchStories();
  }, [userId]);

  const handleFollow = async () => {
    try {
      await api.post('/connections/request', { receiver_id: userId });
      setProfile((prev: any) => ({ ...prev, requested: true }));
    } catch (err) {
      console.error('Follow request failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f9e8ff]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-[#f9e8ff] h-full flex flex-col items-center justify-center">
        <p className="text-black/60">User not found</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full bg-[#f9e8ff] text-black overflow-y-auto no-scrollbar"
    >
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#f9e8ff]/80 backdrop-blur-xl border-b border-primary/10 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-primary/5 rounded-full transition-colors text-black">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-sm tracking-tight text-black">@{profile.username}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-accent p-[3px] shadow-2xl shadow-primary/20">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                {profile.avatar_url ? (
                  <img 
                    src={`http://localhost:8080${profile.avatar_url}`} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center text-3xl font-bold text-black/40">
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-black tracking-tight mb-1 text-black">{profile.full_name}</h2>
          <p className="text-accent font-bold text-sm mb-3">@{profile.username}</p>
          
          <div className="flex items-center gap-1.5 text-black/60 text-xs font-medium bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 mb-6">
            <MapPin className="w-3.5 h-3.5 text-black/40" />
            <span>{profile.location || 'Locolive Community'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-3 mb-8 px-4">
            <button
              onClick={handleFollow}
              disabled={profile.requested}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2
                ${profile.requested 
                  ? 'bg-black/5 text-black/40 border border-black/10' 
                  : 'bg-primary text-white hover:opacity-90 shadow-xl shadow-primary/20'}`}
            >
              {!profile.requested && <UserPlus className="w-4 h-4" />}
              <span>{profile.requested ? 'Requested' : 'Follow'}</span>
            </button>
            <button
              onClick={() => onMessage(userId)}
              className="flex-1 py-3.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-sm font-bold hover:bg-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-center text-black/60 leading-relaxed mb-8 max-w-sm">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex w-full justify-around py-6 border-y border-primary/10 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-black">{stories.length}</span>
              <span className="text-[10px] text-black/60 font-bold uppercase tracking-widest">Stories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-black">{profile.connection_count || 0}</span>
              <span className="text-[10px] text-black/60 font-bold uppercase tracking-widest">Connections</span>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-black/40 uppercase tracking-widest px-1">
          <Grid3x3 className="w-4 h-4" />
          <span>Active Moments</span>
        </div>

        {stories.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-[9/16] bg-primary/5 rounded-2xl overflow-hidden relative group cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-300"
                onClick={() => setViewingStoryIndex(index)}
              >
                <img src={`http://localhost:8080${story.media_url}`} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                    <span>{story.reactions_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-black/40 bg-primary/[0.02] rounded-3xl border border-dashed border-primary/10">
            <div className="w-12 h-12 rounded-full border border-primary/5 flex items-center justify-center mb-4">
              <Grid3x3 className="w-5 h-5 opacity-20" />
            </div>
            <p className="text-sm font-medium">No active stories yet</p>
          </div>
        )}
      </div>

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          currentUser={""} // Pass empty as we are viewing someone else
          currentUserID={""}
        />
      )}
    </motion.div>
  );
};

export default UserProfileView;
