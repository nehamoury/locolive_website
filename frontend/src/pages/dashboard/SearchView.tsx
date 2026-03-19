import { useState, useEffect, useCallback, type FC } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import api from '../../services/api';

interface SearchViewProps {
  onUserSelect?: (userId: string) => void;
}

const SearchView: FC<SearchViewProps> = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/users/search', { params: { query: q } });
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
        ) : !query ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Search for people nearby</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map(user => (
              <div 
                key={user.id} 
                className="flex items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => onUserSelect?.(user.id)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                  {user.avatar_url ? (
                    <img src={`http://localhost:8080${user.avatar_url}`} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                </div>
                {!user.requested ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleConnect(user.id); }}
                    className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold flex items-center space-x-1 hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-white/10 text-gray-400 rounded-lg text-xs font-bold shrink-0">Requested</span>
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
