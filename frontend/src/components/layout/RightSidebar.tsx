import { type FC } from 'react';
import { Users } from 'lucide-react';

const RightSidebar: FC = () => {
  return (
    <aside className="w-80 border-l border-gray-100 bg-white hidden lg:flex flex-col px-5 py-6 overflow-y-auto no-scrollbar h-full flex-shrink-0">

      {/* Your Location */}
      <div className="mb-6 p-6 rounded-[32px] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Location Sharing Active</span>
        </div>
        <p className="text-xs text-gray-400 font-bold mb-4 flex items-center gap-1.5 px-1 uppercase tracking-tight">
          Raipur, Chhattisgarh
        </p>
        
        <div className="space-y-5 px-1">
          {[
            { label: 'Nearby People', value: 12, color: 'bg-[#a855f7]', width: '90%' },
            { label: 'Stories Nearby', value: 6, color: 'bg-[#ec4899]', width: '60%' },
            { label: 'Crossings Today', value: 3, color: 'bg-[#f59e0b]', width: '30%' },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{s.label}</span>
                <span className="text-[11px] font-black text-pink-600 tracking-tighter italic">{s.value}</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: s.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Trending Nearby */}
      <div className="mb-6 p-6 rounded-[32px] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 italic">
          <span className="text-lg">🔥</span> Trending Near You
        </h3>
          {/* Trending Items */}
          {[
            { tag: 'PandriStreetFood', loc: 'Food & Dining', posts: '2.4K' },
            { tag: 'RaipurSunsets', loc: 'Nature & Outdoors', posts: '1.1K' },
            { tag: 'MorningRun5K', loc: 'Fitness', posts: '847' },
            { tag: 'RaipurChaiCulture', loc: 'Local Life', posts: '623' },
            { tag: 'LocalArtsFestival', loc: 'Events', posts: '412' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group py-1">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">{item.loc}</span>
              <span className="text-sm font-black text-black tracking-tight group-hover:text-pink-600 transition-colors">
                #{item.tag}
              </span>
              <span className="text-[10px] font-bold text-gray-400">{item.posts} posts this week</span>
            </div>
          ))}
        </div>

      {/* People You May Know */}
      <div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Users className="w-3 h-3" /> People you may know
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Demo User', handle: '@demo', initial: 'D', color: 'from-yellow-400 to-orange-400' },
            { name: 'Rahul Verma', handle: '@rahul', initial: 'R', color: 'from-emerald-400 to-teal-500' },
            { name: 'Arjun Singh', handle: '@arjun', initial: 'A', color: 'from-blue-400 to-indigo-500' }
          ].map((person, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center font-black text-white text-sm`}>
                  {person.initial}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-sm text-gray-800">{person.name}</span>
                  <span className="text-[11px] text-gray-400">{person.handle}</span>
                </div>
              </div>
              <button className="text-[11px] font-bold text-pink-500 hover:text-white px-3 py-1 rounded-full border border-pink-200 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:border-transparent transition-all">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default RightSidebar;
