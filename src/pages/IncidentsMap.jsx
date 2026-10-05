import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    const heatPoints = points
      .filter(p => p.latitude && p.longitude)
      .map(p => [
        p.latitude, 
        p.longitude, 
        p.issue_type === 'PIPE_BURST' ? 1.0 : 0.6
      ]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.65: 'lime',
        0.85: 'orange',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function IncidentsMap() {
  const [reports, setReports] = useState([]);
  const [mapMode, setMapMode] = useState('pins');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Fetch only active reports so resolved ones disappear from the GIS map and thermal radar
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .neq('status', 'resolved')
      .neq('status', 'RESOLVED');

    if (!error && data) {
      setReports(data);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-73px)] relative">
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-slate-200 flex gap-2">
        <button
          onClick={() => setMapMode('thermal')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            mapMode === 'thermal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Thermal Radar
        </button>
        <button
          onClick={() => setMapMode('pins')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            mapMode === 'pins' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Precision Pins
        </button>
      </div>

      <div className="flex-grow w-full h-full">
        <MapContainer 
          center={[24.7804, 93.9397]} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapMode === 'thermal' ? (
            <HeatmapLayer points={reports} />
          ) : (
            reports.map((report) => (
              report.latitude && report.longitude && (
                <Marker key={report.id} position={[report.latitude, report.longitude]}>
                  <Popup>
                    <div className="p-2 max-w-xs">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {report.issue_type || 'WATER_SHORTAGE'}
                      </span>
                      <p className="text-xs text-slate-700 mt-2 font-medium">{report.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))
          )}
        </MapContainer>
      </div>
    </div>
  );
}