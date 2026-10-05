import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function AiTriageFeed() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  const fetchTriageReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTriageReports();
  }, []);

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'PIPE_BURST': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANAL_BLOCK': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONTAMINATION': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const parseReportContent = (rawDescription) => {
    if (!rawDescription) return { text: '', imageUrl: null };
    const photoMatch = rawDescription.match(/\[PHOTO ATTACHED:\s*(.*?)\]/);
    if (photoMatch) {
      const cleanText = rawDescription.replace(photoMatch[0], '').trim();
      return { text: cleanText, imageUrl: photoMatch[1].trim() };
    }
    return { text: rawDescription, imageUrl: null };
  };

  const filteredReports = reports.filter(r => {
    if (filterTab === 'active') return r.status !== 'resolved';
    if (filterTab === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">AI Triage & Telemetry Feed</h1>
          <p className="text-sm text-slate-500">Real-time local Flan-T5 classification and filtered municipal telemetry.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sub-Tabs */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'active' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({reports.filter(r => r.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setFilterTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterTab === 'resolved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({reports.filter(r => r.status === 'resolved').length})
            </button>
          </div>

          <button
            onClick={fetchTriageReports}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
          >
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Analyzing incoming telemetry streams...</div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-500">
          No reports found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const { text, imageUrl } = parseReportContent(report.description);
            return (
              <div key={report.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getCategoryBadge(report.issue_type)}`}>
                      {report.issue_type || 'WATER_SHORTAGE'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    "{text}"
                  </p>

                  {imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                      <img src={imageUrl} alt="Incident Evidence" className="w-full object-cover max-h-48" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>📍 Lat: {report.latitude?.toFixed(4)}, Lon: {report.longitude?.toFixed(4)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {report.status || 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}