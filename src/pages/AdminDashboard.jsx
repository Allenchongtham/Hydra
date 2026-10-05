import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('active');
  const [modalImage, setModalImage] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [resolvingCluster, setResolvingCluster] = useState(null);
  const [actionPasscode, setActionPasscode] = useState('');
  const [actionAuthError, setActionAuthError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'hydra2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const fetchReports = async () => {
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
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  const parseReportContent = (rawDescription) => {
    if (!rawDescription) return { text: '', imageUrl: null };
    const match = rawDescription.match(/\[PHOTO ATTACHED:\s*(.*?)\]/);
    if (match) {
      const clean = rawDescription.replace(match[0], '').trim();
      return { text: clean || 'Photo attached report', imageUrl: match[1].trim() };
    }
    return { text: rawDescription, imageUrl: null };
  };

  const getClusteredIncidents = () => {
    const clusters = {};

    reports.forEach((report) => {
      const latKey = report.latitude ? report.latitude.toFixed(3) : '0.000';
      const lonKey = report.longitude ? report.longitude.toFixed(3) : '0.000';
      const issueType = report.issue_type || 'WATER_SHORTAGE';
      const key = `${issueType}_${latKey}_${lonKey}`;

      if (!clusters[key]) {
        clusters[key] = {
          clusterId: key,
          issue_type: issueType,
          latitude: report.latitude,
          longitude: report.longitude,
          reports: [],
          status: 'active'
        };
      }
      clusters[key].reports.push(report);
    });

    return Object.values(clusters).map(cluster => {
      const allResolved = cluster.reports.every(r => r.status === 'resolved');
      return { ...cluster, status: allResolved ? 'resolved' : 'active' };
    });
  };

  const confirmResolveCluster = async (e) => {
    e.preventDefault();
    if (actionPasscode !== 'hydra2026' && actionPasscode !== 'admin') {
      setActionAuthError(true);
      return;
    }

    if (!resolvingCluster) return;

    const reportIds = resolvingCluster.reports.map(r => r.id);
    const { data, error } = await supabase
      .from('reports')
      .update({ status: 'resolved' })
      .in('id', reportIds)
      .select();

    if (error) {
      alert('Failed to update: ' + error.message);
    } else if (!data || data.length === 0) {
      alert('Update blocked: Supabase RLS policy prevents updating rows.');
    } else {
      setResolvingCluster(null);
      setActionPasscode('');
      setActionAuthError(false);
      fetchReports();
    }
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'PIPE_BURST': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANAL_BLOCK': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONTAMINATION': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-md mx-auto w-full flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl w-full text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xs">
            SECURE
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Authority Authentication</h2>
          <p className="text-xs text-slate-500 mb-6">Enter municipal clearance passcode to access command center.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {authError && <p className="text-xs text-red-600 font-bold">Invalid clearance passcode.</p>}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Unlock Command Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  const clusters = getClusteredIncidents();
  const filteredClusters = clusters.filter(c => {
    if (filterTab === 'active') return c.status === 'active';
    if (filterTab === 'resolved') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Authority Incident Command</h1>
          <p className="text-sm text-slate-500">Autonomous spatial clustering and bulk municipal intervention console.</p>
        </div>

        <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'active' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}
          >
            Active ({clusters.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'resolved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
          >
            Resolved ({clusters.filter(c => c.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            All ({clusters.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Aggregating telemetry clusters...</div>
      ) : filteredClusters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-500">
          No incident clusters found under this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClusters.map((cluster) => (
            <div 
              key={cluster.clusterId} 
              className={`bg-white rounded-2xl p-6 border shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                cluster.status === 'resolved' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2 flex-grow">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getCategoryBadge(cluster.issue_type)}`}>
                    {cluster.issue_type}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    Reports Clustered: {cluster.reports.length} (~200m)
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${cluster.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Coordinates: {cluster.latitude?.toFixed(4)}, {cluster.longitude?.toFixed(4)}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {cluster.reports.map((r, idx) => {
                    const parsed = parseReportContent(r.description);
                    return (
                      <div key={r.id || idx} className="text-xs text-slate-700 flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                        <span className="truncate pr-2 font-medium">{parsed.text}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {parsed.imageUrl && (
                            <button
                              onClick={() => setModalImage(parsed.imageUrl)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition"
                            >
                              See Photo
                            </button>
                          )}
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                {cluster.status === 'active' ? (
                  <button
                    onClick={() => setResolvingCluster(cluster)}
                    className="w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
                  >
                    Resolve Incident Cluster ({cluster.reports.length})
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl">
                    Resolved Successfully
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvingCluster && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Authorize Resolution</h3>
              <button
                onClick={() => { setResolvingCluster(null); setActionPasscode(''); setActionAuthError(false); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition"
              >
                X
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter municipal clearance passcode to confirm resolution of cluster ({resolvingCluster.reports.length} reports).
            </p>
            <form onSubmit={confirmResolveCluster} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Passcode"
                value={actionPasscode}
                onChange={(e) => setActionPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {actionAuthError && <p className="text-xs text-red-600 font-bold">Invalid clearance passcode.</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setResolvingCluster(null); setActionPasscode(''); setActionAuthError(false); }}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 relative shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Incident Evidence Photo</h3>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition"
              >
                X
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[70vh]">
              <img src={modalImage} alt="Incident Evidence" className="w-full object-contain max-h-[70vh]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}