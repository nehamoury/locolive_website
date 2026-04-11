import { useState } from 'react';
import { Search, Check, X, Ban, User, Flag } from 'lucide-react';
import type { AdminReport } from '../../types/admin';

const mockReports: AdminReport[] = [
  {
    id: '1',
    reporter: { id: '1', username: 'priya_singh', displayName: 'Priya Singh', avatar: '', status: 'online', lastLocation: { lat: 12.9716, lng: 77.5946 }, connectionsCount: 234, crossingsCount: 56, createdAt: '', isBanned: false },
    reported: { id: '2', username: 'raj_kumar', displayName: 'Raj Kumar', avatar: '', status: 'online', lastLocation: { lat: 19.076, lng: 72.8777 }, connectionsCount: 189, crossingsCount: 42, createdAt: '', isBanned: false },
    type: 'user',
    contentId: '2',
    reason: 'Inappropriate behavior',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    reporter: { id: '3', username: 'alex_m', displayName: 'Alex Martinez', avatar: '', status: 'offline', lastLocation: { lat: 28.6139, lng: 77.209 }, connectionsCount: 456, crossingsCount: 89, createdAt: '', isBanned: false },
    reported: { id: '4', username: 'sarah_j', displayName: 'Sarah Johnson', avatar: '', status: 'online', lastLocation: { lat: 17.385, lng: 78.4867 }, connectionsCount: 312, crossingsCount: 67, createdAt: '', isBanned: false },
    type: 'reel',
    contentId: 'reel3',
    reason: 'Spam content',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    reporter: { id: '5', username: 'mike_chen', displayName: 'Mike Chen', avatar: '', status: 'offline', lastLocation: { lat: 13.0827, lng: 80.27 }, connectionsCount: 78, crossingsCount: 12, createdAt: '', isBanned: false },
    reported: { id: '1', username: 'priya_singh', displayName: 'Priya Singh', avatar: '', status: 'online', lastLocation: { lat: 12.9716, lng: 77.5946 }, connectionsCount: 234, crossingsCount: 56, createdAt: '', isBanned: false },
    type: 'story',
    contentId: 'story5',
    reason: 'Harassment',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

function formatTime(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [reports, setReports] = useState<AdminReport[]>(mockReports);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && report.status === 'pending';
    if (filter === 'resolved') return matchesSearch && report.status !== 'pending';
    return matchesSearch;
  });

  const handleResolve = (reportId: string) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
  };

  const handleIgnore = (reportId: string) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: 'ignored' } : r));
  };

  const handleBan = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      console.log(`Banned user: ${report.reported.displayName}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <span className="text-sm text-gray-500">{filteredReports.length} reports</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reporter</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reported</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-900">{report.reporter.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Flag className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-medium text-gray-900">{report.reported.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium uppercase">
                    {report.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{report.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatTime(report.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleResolve(report.id)}
                          className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Resolve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBan(report.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleIgnore(report.id)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Ignore"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;