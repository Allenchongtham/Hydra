import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Format points for leaflet.heat: [lat, lng, intensity]
    const heatPoints = points
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude, p.longitude, p.intensity || 1.0]);

    // Create the heat layer with weather-radar styling (blue -> green -> yellow -> red)
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.65: 'lime',
        0.85: 'yellow',
        1.0: 'red'
      }
    });

    heatLayer.addTo(map);

    // Cleanup layer when component unmounts or points change
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}