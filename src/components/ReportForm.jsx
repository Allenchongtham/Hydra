import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function ReportForm({ onReportSubmitted }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        alert('Unable to retrieve your location. Please check permissions.');
        console.error(err);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      alert('Please enter a description of the issue.');
      return;
    }
    if (!location) {
      alert('Please capture your GPS location.');
      return;
    }

    setLoading(true);
    try {
      // Insert directly into Supabase without requiring user_id constraint friction
      const { error } = await supabase.from('reports').insert({
        description,
        latitude: location.lat,
        longitude: location.lon,
        location: `POINT(${location.lon} ${location.lat})`,
        issue_type: 'NO_WATER',
        severity: 'high'
      });

      if (error) throw error;

      alert('Report broadcasted successfully!');
      setDescription('');
      setLocation(null);
      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Issue Description
        </label>
        <textarea 
          placeholder="e.g., No water has reached our section of the canal since morning..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 text-sm transition h-32 resize-none shadow-sm" 
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Geotag Location
        </label>
        <button 
          type="button" 
          onClick={getLocation} 
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
            location 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span>{location ? '📍 Location Captured' : '📍 Detect GPS Coordinates'}</span>
        </button>
        {location && (
          <p className="text-[11px] text-emerald-600 font-medium mt-1.5 text-center">
            Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
          </p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 text-sm mt-2"
      >
        {loading ? 'Broadcasting...' : 'Broadcast Ground-Truth Report'}
      </button>
    </form>
  );
}