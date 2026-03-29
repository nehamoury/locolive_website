import { type FC } from 'react';
import { MapPin, TrendingUp, Info } from 'lucide-react';

interface RightSidebarProps {
  crossingsToday?: number;
}

const RightSidebar: FC<RightSidebarProps> = ({ crossingsToday = 0 }) => {
  return (
    <aside className="w-80 h-full bg-white flex flex-col p-6 overflow-y-auto no-scrollbar font-poppins gap-8">

      {/* Your Location Widget */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-[0.1em] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-500" /> Your Location
          </h3>
          <button className="text-gray-300 hover:text-pink-500 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-5 mb-6 shadow-sm flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest">Location Sharing Active</span>
        </div>

        <div className="mb-8">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tight mb-1">Raipur, Chhattisgarh</p>
          <div className="h-[2px] w-12 bg-pink-100 rounded-full" />
        </div>

        <div className="space-y-7">
          {[
            { label: 'Nearby People', value: 12, color: 'bg-[#FF3B8E]', width: '85%' },
            { label: 'Stories Nearby', value: 6, color: 'bg-[#A436EE]', width: '55%' },
            { label: 'Crossings Today', value: crossingsToday, color: 'bg-purple-600', width: `${Math.min(100, crossingsToday * 8)}%` },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{s.label}</span>
                <span className="text-sm font-bold text-pink-500 italic tracking-tighter">{s.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${s.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.05)]`} 
                  style={{ width: s.width }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-50 shrink-0" />

      {/* Trending Widget */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-[0.1em] italic">Trending Near You</h3>
        </div>

        <div className="space-y-7">
          {[
            { tag: 'PandriStreetFood', category: 'Food & Dining', posts: '2.4K' },
            { tag: 'RaipurSunsets', category: 'Nature & Outdoors', posts: '1.1K' },
            { tag: 'MorningRun5K', category: 'Fitness', posts: '847' },
            { tag: 'RaipurChaiCulture', category: 'Local Life', posts: '623' },
            { tag: 'LocalArtsFestival', category: 'Events', posts: '412' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{item.category}</span>
              <span className="text-[16px] font-bold text-gray-900 group-hover:text-pink-500 transition-colors leading-tight tracking-tight">
                #{item.tag}
              </span>
              <span className="text-[11px] font-bold text-gray-400 mt-1.5">{item.posts} posts this week</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
