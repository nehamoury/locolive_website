import { type FC } from 'react';

interface RightSidebarProps {
  crossingsToday?: number;
}

const RightSidebar: FC<RightSidebarProps> = ({ crossingsToday = 0 }) => {
  return (
    <aside className="w-80 border-l border-gray-50 bg-white hidden lg:flex flex-col px-6 py-6 overflow-y-auto no-scrollbar h-full flex-shrink-0 font-poppins">

      {/* Your Location */}
      <div className="mb-6 px-1 py-1">
        <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
           <span className="text-pink-500 text-lg">📍</span> Your Location
        </h3>
        
        <div className="mb-8 p-5 rounded-[24px] bg-[#F0FDF4] border border-[#DCFCE7] shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-green-700 text-[11px] font-black uppercase tracking-wider">Location Sharing Active</span>
        </div>
        
        <div className="mb-6">
           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mb-1">Raipur, Chhattisgarh</p>
           <div className="w-full h-[1px] bg-gray-50" />
        </div>
        
        <div className="space-y-6">
          {[
            { label: 'Nearby People', value: 12, color: 'bg-[#8B5CF6]', width: '85%' },
            { label: 'Stories Nearby', value: 6, color: 'bg-[#FF3B8E]', width: '55%' },
            { label: 'Crossings Today', value: crossingsToday, color: 'bg-[#A855F7]', width: `${Math.min(100, Math.max(5, crossingsToday * 10))}%` },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{s.label}</span>
                <span className="text-[13px] font-black text-[#FF3B8E] tracking-tighter italic">{s.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: s.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-50 my-8" />

      {/* Trending Nearby */}
      <div className="mb-6 px-1">
        <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2 italic">
          <span className="text-lg">🔥</span> Trending Near You
        </h3>
        <div className="space-y-6">
          {[
            { tag: 'PandriStreetFood', category: 'Food & Dining', posts: '2.4K' },
            { tag: 'RaipurSunsets', category: 'Nature & Outdoors', posts: '1.1K' },
            { tag: 'MorningRun5K', category: 'Fitness', posts: '847' },
            { tag: 'RaipurChaiCulture', category: 'Local Life', posts: '623' },
            { tag: 'LocalArtsFestival', category: 'Events', posts: '412' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight mb-1">{item.category}</span>
              <span className="text-[15px] font-black text-gray-900 group-hover:text-[#FF3B8E] transition-colors leading-tight">
                #{item.tag}
              </span>
              <span className="text-[11px] font-bold text-gray-400 mt-1">{item.posts} posts this week</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
