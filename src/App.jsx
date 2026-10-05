import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import ReportForm from './components/ReportForm';
import MapView from './components/MapView';
import IncidentsMap from './pages/IncidentsMap';
import AiTriageFeed from './pages/AiTriageFeed';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    const { data, error } = await supabase.from('reports').select('*');
    if (!error && data) {
      setStats({
        total: data.length,
        active: data.filter(r => String(r.status || '').toLowerCase() !== 'resolved').length,
        resolved: data.filter(r => String(r.status || '').toLowerCase() === 'resolved').length
      });
    }
  };

  const handleReportSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              H
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Hydra</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Observability Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'map' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              Incidents Map
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'triage' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              AI Triage Feed
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              Authority Command
            </button>
          </nav>
        </div>

        {/* User Role Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">Admin / Farmer</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-[10px] text-emerald-600 font-semibold">Live MVP Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {activeTab === 'dashboard' && 'Farmer & Community Dashboard'}
              {activeTab === 'map' && 'Incidents GIS Command Center'}
              {activeTab === 'triage' && 'AI Triage & Telemetry Feed'}
              {activeTab === 'admin' && 'Authority Incident Command Center'}
            </h2>
            <p className="text-xs text-slate-500">Real-time ground-truth irrigation telemetry and reporting.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
              System Operational
            </span>
          </div>
        </header>

        {/* Dynamic View Router */}
        {activeTab === 'dashboard' && (
          <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Reports</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  All
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Incidents</p>
                  <h3 className="text-3xl font-extrabold text-amber-600">{stats.active}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  !
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Resolved</p>
                  <h3 className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  OK
                </div>
              </div>
            </div>

            {/* Interactive Split Grid: Report Form & Map View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Report an Issue</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit localized water shortages or canal blocks.</p>
                </div>
                <ReportForm onReportSubmitted={handleReportSubmitted} />
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Irrigation Observation Map</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Live geospatial pins of farmer submissions.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition"
                  >
                    Expand Map View
                  </button>
                </div>
                <div className="flex-grow min-h-[450px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <MapView key={refreshKey} />
                </div>
              </div>
            </div>
          </main>
        )}

        {activeTab === 'map' && <IncidentsMap />}
        {activeTab === 'triage' && <AiTriageFeed />}
        {activeTab === 'admin' && <AdminDashboard />}

      </div>
    </div>
  );
}