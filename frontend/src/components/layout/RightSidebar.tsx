import { type FC } from 'react';
import { CloudSun, Droplets, Wind, Sun, Hash } from 'lucide-react';

const RightSidebar: FC = () => {
  return (
    <aside className="w-80 border-l border-white/5 bg-[#0B0E14] hidden lg:flex flex-col px-6 py-8 overflow-y-auto no-scrollbar h-full flex-shrink-0">
      
      {/* Weather Widget */}
      <div className="mb-8 p-5 rounded-3xl bg-gradient-to-br from-[#1E2538] to-[#0F1420] border border-white/5 relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors" />
        
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest leading-none">
            Raipur, Chhattisgarh
          </p>
          <div className="flex items-center gap-3 mb-4">
            <CloudSun className="w-10 h-10 text-amber-400 fill-amber-400/20" />
            <div className="flex flex-col">
              <span className="text-4xl font-black text-white leading-none">28°C</span>
              <span className="text-xs text-slate-300 font-medium">Partly cloudy</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> 68%</span>
            <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-emerald-400" /> 14 km/h</span>
            <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> UV 5</span>
          </div>
        </div>
      </div>

      {/* Trending Nearby */}
      <div className="mb-10">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>Trending Nearby</span>
        </h3>
        <div className="space-y-4">
          {[
            { tag: 'ChhattisgarhFood', loc: 'Pandri Market', posts: '1.2K' },
            { tag: 'RaipurSunsets', loc: 'Talibandha', posts: '847' },
            { tag: 'MorningRun', loc: 'Nandan Van', posts: '623' },
            { tag: 'LocalCuisine', loc: 'Sadar Bazar', posts: '412' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer group">
              <span className="text-[10px] font-bold text-slate-500">{item.loc}</span>
              <span className="text-sm font-black text-white group-hover:text-pink-400 transition-colors flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#EE2A7B]" />{item.tag}
              </span>
              <span className="text-[10px] text-slate-600 font-medium">{item.posts} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* People You May Know */}
      <div>
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>People you may know</span>
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Demo User', handle: '@demo', initial: 'D', color: 'bg-yellow-400 text-black' },
            { name: 'Rahul Verma', handle: '@rahul', initial: 'R', color: 'bg-emerald-400 text-black' },
            { name: 'Arjun Singh', handle: '@arjun', initial: 'A', color: 'bg-orange-400 text-black' }
          ].map((person, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${person.color}`}>
                  {person.initial}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-white group-hover:text-pink-400 transition-colors">{person.name}</span>
                  <span className="text-[11px] font-medium text-slate-500">{person.handle}</span>
                </div>
              </div>
              <button className="text-[11px] font-bold text-white/70 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors flex items-center gap-1">
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
