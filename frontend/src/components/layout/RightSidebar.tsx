import { type FC } from 'react';
import { CloudSun, Hash, MapPin, TrendingUp, Users } from 'lucide-react';

const RightSidebar: FC = () => {
  return (
    <aside className="w-80 border-l border-gray-100 bg-white hidden lg:flex flex-col px-5 py-6 overflow-y-auto no-scrollbar h-full flex-shrink-0">

      {/* Your Location */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-600">Location Sharing Active</span>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Raipur, Chhattisgarh
        </p>
        {/* Weather */}
        <div className="flex items-center gap-3">
          <CloudSun className="w-9 h-9 text-amber-500" />
          <div>
            <span className="text-2xl font-black text-gray-800 leading-none">28°C</span>
            <p className="text-xs text-gray-400">Partly cloudy</p>
          </div>
        </div>
      </div>

      {/* Nearby Stats */}
      <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" /> Nearby
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Nearby People', value: 12, color: 'from-pink-500 to-rose-400', width: '75%' },
            { label: 'Stories Nearby', value: 6, color: 'from-purple-500 to-indigo-400', width: '45%' },
            { label: 'Crossings Today', value: 3, color: 'from-amber-400 to-orange-400', width: '25%' },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className="text-xs font-bold text-gray-800">{s.value}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: s.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Nearby */}
      <div className="mb-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          🔥 Trending Near You
        </h3>
        <div className="space-y-3">
          {[
            { tag: 'PandriStreetFood', loc: 'Food & Dining', posts: '2.4K' },
            { tag: 'RaipurSunsets', loc: 'Nature & Outdoors', posts: '1.1K' },
            { tag: 'MorningRun5K', loc: 'Fitness', posts: '847' },
            { tag: 'RaipurChaiCulture', loc: 'Local Life', posts: '623' },
            { tag: 'LocalArtsFestival', loc: 'Events', posts: '412' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-[10px] font-semibold text-gray-400">{item.loc}</span>
              <span className="text-sm font-bold text-gray-800 group-hover:text-pink-500 transition-colors flex items-center gap-1">
                <Hash className="w-3 h-3 text-pink-500" />{item.tag}
              </span>
              <span className="text-[10px] text-gray-400">{item.posts} posts this week</span>
            </div>
          ))}
        </div>
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
