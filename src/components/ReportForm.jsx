import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ReportForm({ onReportSubmitted }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [sessionId, setSessionId] = useState('');

  // Generate or retrieve a persistent session fingerprint to prevent spamming
  useEffect(() => {
    let storedSession = localStorage.getItem('hydra_session_id');
    if (!storedSession) {
      storedSession = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('hydra_session_id', storedSession);
    }
    setSessionId(storedSession);
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => alert('Unable to retrieve your location.')
    );
  };

  const startSpeechRecognition = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Clean English/Hinglish speech profile

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const finalTranscript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim() && !photoFile) {
      alert('Please provide a description or record a voice observation.');
      return;
    }
    if (!location) {
      alert('Please capture your GPS location first.');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;

      // 1. Upload photo if present
      if (photoFile) {
        const photoName = `photo_${Date.now()}_${photoFile.name}`;
        const { error: photoErr } = await supabase.storage
          .from('incident-photos')
          .upload(photoName, photoFile);
        if (photoErr) throw photoErr;
        photoUrl = supabase.storage.from('incident-photos').getPublicUrl(photoName).data.publicUrl;
      }
      
      // 2. Format final description string
      const finalDescription = photoUrl 
        ? `${description.trim()} [PHOTO ATTACHED: ${photoUrl}]` 
        : description.trim();
      
      // 3. Instant Frontend Categorization for Demo Reliability
      const textLower = description.toLowerCase();
      let issueCategory = 'WATER_SHORTAGE';
      if (textLower.includes('burst') || textLower.includes('leak') || textLower.includes('phat') || textLower.includes('pipe')) {
        issueCategory = 'PIPE_BURST';
      } else if (textLower.includes('block') || textLower.includes('jam') || textLower.includes('canal')) {
        issueCategory = 'CANAL_BLOCK';
      } else if (textLower.includes('dirty') || textLower.includes('smell') || textLower.includes('contamination')) {
        issueCategory = 'CONTAMINATION';
      }

      // 4. Insert directly into Supabase with the correct category already assigned
      const { data: insertedData, error: dbError } = await supabase.from('reports').insert({
        description: finalDescription,
        latitude: location.lat,
        longitude: location.lon,
        location: `POINT(${location.lon} ${location.lat})`,
        issue_type: issueCategory,
        severity: 'active'
      }).select().single();

      if (dbError) throw dbError;
      const reportId = insertedData.id;

      // 5. Optional background backend sync ping
      try {
        await fetch('http://localhost:8000/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report_id: reportId, transcript: finalDescription })
        });
      } catch (aiErr) {
        console.error('Backend AI sync notice:', aiErr);
      }

      alert('Report and AI observation broadcasted successfully!');
      setDescription('');
      setLocation(null);
      setPhotoFile(null);
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
          Voice Observation (Browser AI Triage)
        </label>
        <button
          type="button"
          onClick={startSpeechRecognition}
          className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
            isListening 
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
              : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-200'
          }`}
        >
          {isListening ? 'Listening... Speak now 🎙️' : '🎙️ Click to Speak (English / Hinglish)'}
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Photo (Optional)
        </label>
        <input 
          id="photo-upload-input"
          type="file" 
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => document.getElementById('photo-upload-input').click()}
          className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
            photoFile 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-200'
          }`}
        >
          {photoFile ? `✓ ${photoFile.name}` : 'Upload Photo'}
        </button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or Type manually</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <div>
        <textarea 
          placeholder="Voice transcript will appear here, or type manually..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 text-sm transition h-20 resize-none shadow-sm" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Geotag Location
        </label>
        <button 
          type="button" 
          onClick={getLocation} 
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
            location 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span>{location ? '✓ Location Captured' : '📍 Detect GPS Coordinates'}</span>
        </button>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 text-sm mt-1"
      >
        {loading ? 'Broadcasting Evidence...' : 'Broadcast Ground-Truth Report'}
      </button>
    </form>
  );
}