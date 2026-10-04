import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../services/supabase';

// CRITICAL: Leaflet CSS required for the map to render
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for React-Leaflet's default marker icon bug
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function MapView() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setReports(data);
      }
    };
    
    fetchReports();
  }, []);

  return (
    <MapContainer 
      center={[24.55, 93.81]} // Centered on the region
      zoom={11} 
      style={{ height: '100%', width: '100%', minHeight: '450px', zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports.map((report) => (
        report.latitude && report.longitude ? (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-slate-800 text-sm mb-1">
                  Issue: {report.issue_type || 'Field Report'}
                </p>
                <p className="text-xs text-slate-600 mb-2">{report.description}</p>
                <span className={`text-[10px] px-2 py-1 rounded-full text-white ${
                  report.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {report.status?.toUpperCase() || 'NEW'}
                </span>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}