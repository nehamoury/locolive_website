import { type FC } from 'react';
import { MapPin, TrendingUp, Info, Users, Compass, Footprints } from 'lucide-react';

interface RightSidebarProps {
  crossingsToday?: number;
}

const RightSidebar: FC<RightSidebarProps> = ({ crossingsToday = 0 }) => {
  return (
    <aside className="w-80 h-full bg-white flex flex-col p-5 overflow-y-auto no-scrollbar font-poppins gap-6">

      {/* Your Location Widget */}
      <div className="flex flex-col bg-white rounded-[24px] border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 relative overflow-hidden group min-h-[160px]">
        
        {/* Map Background Pattern / Image placeholder */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
             style={{ 
               backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400&h=200')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/30 z-0" />

        <div className="relative z-10 flex justify-between items-center mb-6">
          <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5 drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#FF3B8E]" /> Your Location
          </h3>
          <button className="w-7 h-7 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-full text-gray-500 hover:text-[#FF3B8E] hover:bg-white transition-all shadow-sm">
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 bg-white/90 backdrop-blur-md border border-white/60 rounded-[12px] p-2.5 mb-4 shadow-sm flex items-center gap-2 self-start">
          <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Location Sharing Active</span>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-[16px] font-bold text-gray-900 tracking-tight leading-none mb-1">Raipur, Chhattisgarh</p>
          <div className="h-[3px] w-8 bg-gradient-to-r from-[#FF3B8E] to-[#A436EE] rounded-full mt-2" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="flex flex-col gap-3">
        <div className="bg-gradient-to-br from-[#FFF0F6]/80 to-white border border-pink-100/50 rounded-[20px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FF3B8E]/10 flex items-center justify-center text-[#FF3B8E]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-tight">Nearby People</span>
          </div>
          <span className="text-xl font-black text-gray-900">12</span>
        </div>

        <div className="bg-gradient-to-br from-[#F5E6FF]/80 to-white border border-purple-100/50 rounded-[20px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#A436EE]/10 flex items-center justify-center text-[#A436EE]">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-tight">Stories Nearby</span>
          </div>
          <span className="text-xl font-black text-gray-900">7</span>
        </div>

        <div className="bg-gradient-to-br from-[#FFF5E6]/80 to-white border border-orange-100/50 rounded-[20px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FF9F1A]/10 flex items-center justify-center text-[#FF9F1A]">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-gray-700 tracking-tight">Crossings Today</span>
          </div>
          <span className="text-xl font-black text-gray-900">{crossingsToday || 2}</span>
        </div>
      </div>

      {/* Trending Widget */}
      <div className="flex flex-col bg-white rounded-[24px] border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4.5 h-4.5 text-[#FF3B8E]" />
          <h3 className="text-[12px] font-black text-gray-900 tracking-tight uppercase">Trending Near You</h3>
        </div>

        <div className="space-y-4">
          {[
            { tag: 'PandriStreetFood', category: 'Food & Dining', posts: '2.4K' },
            { tag: 'RaipurSunsets', category: 'Nature & Outdoors', posts: '1.2K' },
            { tag: 'MorningRun5K', category: 'Fitness', posts: '847' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group">
              <span className="text-[9px] font-bold text-gray-400/80 uppercase tracking-widest mb-1.5">{item.category}</span>
              <span className="text-[14.5px] font-bold text-gray-800 group-hover:text-[#FF3B8E] transition-colors leading-tight tracking-tight">
                #{item.tag}
              </span>
              <span className="text-[11px] font-medium text-gray-500 mt-1">{item.posts} posts this week</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default RightSidebar;
