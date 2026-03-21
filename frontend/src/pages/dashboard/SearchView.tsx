import { useState, useEffect, useCallback, type FC } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../services/api';

interface SearchViewProps {
  onUserSelect?: (userId: string) => void;
}

const SearchView: FC<SearchViewProps> = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      // Use 'q' as the parameter name to match backend searchUsersRequest struct tag `form:"q"`
      const res = await api.get('/users/search', { params: { q } });
      setResults(res.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleConnect = async (userId: string) => {
    try {
      await api.post('/connections/request', { user_id: userId });
      setResults(prev => prev.map(u => u.id === userId ? { ...u, requested: true } : u));
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  return (
    <div className="h-full bg-black text-white overflow-y-auto no-scrollbar pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="sticky top-0 bg-black z-10 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No users found for "{query}"</p>
          </div>
        ) : results.length === 0 && !query ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 animate-pulse">
              <Search className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-medium tracking-wide">Find your next connection</p>
            <p className="text-xs opacity-50 mt-1">Discover people nearby and start chatting</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {results.map(user => (
              <div 
                key={user.id} 
                className="group flex items-center p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/10"
                onClick={() => onUserSelect?.(user.id)}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px] transition-transform group-hover:scale-105 active:scale-95 duration-300">
                    <div className="w-full h-full rounded-full bg-black p-[2px]">
                      {user.avatar_url ? (
                        <img src={`http://localhost:8080${user.avatar_url}`} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-white/90">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Active Indicator or Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                </div>

                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-base text-white/90 truncate">{user.full_name}</p>
                    {user.is_verified && (
                      <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium tracking-tight">@{user.username}</p>
                </div>

                {!user.requested ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleConnect(user.id); }}
                    className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all shadow-xl shrink-0"
                  >
                    <span>Follow</span>
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-white/10 text-gray-300 rounded-xl text-xs font-bold shrink-0 border border-white/5">Requested</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
