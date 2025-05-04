import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { supabase } from '@/lib/supabaseClient';
function SearchControl() {
  const map = useMap();
  useEffect(() => {
    const searchControl = L.control({ position: 'topright' });
    searchControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.style.backgroundColor = 'white';
      div.style.padding = '6px';
      div.innerHTML = '<input id="searchbox" type="text" placeholder="📍 Ort suchen..." style="width: 120px; padding: 2px;" />';
      L.DomEvent.disableClickPropagation(div);

      setTimeout(() => {
        const input = document.getElementById('searchbox');
        if (input) {
          input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
              const query = input.value;
              if (!query) return;
              const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
              const response = await fetch(url);
              const data = await response.json();
              if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([parseFloat(lat), parseFloat(lon)], 13);
              } else {
                alert('Ort nicht gefunden.');
              }
            }
          });
        }
      }, 100);

      return div;
    };
    searchControl.addTo(map);
  }, [map]);
  return null;
}

function RoutePlanner({ onRouteReady }) {
  const map = useMap();
  const [points, setPoints] = useState([]);
  window.setCoordsFromAlt = onRouteReady;
  window.lastRoutePoints = points;

  useMapEvents({
    click(e) {
      setPoints(prev => [...prev, e.latlng]);
    }
  });

  useEffect(() => {
    if (points.length >= 2) {
      const coordsQuery = points.map(p => `${p.lng},${p.lat}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
            onRouteReady(coords);
          }
        })
        .catch(() => {
          alert("Routing fehlgeschlagen");
        });
    }
  }, [points]);

  return null;
}

export default function LeafletMapBack() {
  const [passList, setPassList] = useState([]);
  const [selectedPassId, setSelectedPassId] = useState(null);
  const [marker, setMarker] = useState(null);
  const [coords, setCoords] = useState([]);
  const [circle, setCircle] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [autoZoom, setAutoZoom] = useState(true);
  const [routingMode, setRoutingMode] = useState(false);
  const drawRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    const fetchNames = async () => {
      const { data, error } = await supabase.from('passes').select('id, name, type');
      if (!error) setPassList(data);
    };
    fetchNames();
  }, []);

  const zoomToFeatures = () => {
    const map = mapRef.current;
    if (!map || !autoZoom) return;
    if (marker) {
      map.setView([marker.lat, marker.lng], 12);
    } else if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(pt => [pt.lat, pt.lng]));
      map.fitBounds(bounds);
    } else if (circle) {
      map.setView(circle.center, 12);
    }
  };

  const fetchDetails = async (id) => {
    const { data } = await supabase
      .from('passes')
      .select('marker_lat, marker_lng, coords, circle_center_lat, circle_center_lng, circle_radius')
      .eq('id', id)
      .single();
    if (data) {
      const m = data.marker_lat && data.marker_lng ? { lat: data.marker_lat, lng: data.marker_lng } : null;
      const rawCoords = Array.isArray(data.coords) ? data.coords : [];
      const c = rawCoords.map(c => ({ lat: c[0], lng: c[1] }));
      const ci = data.circle_center_lat && data.circle_center_lng && data.circle_radius ? {
        center: { lat: data.circle_center_lat, lng: data.circle_center_lng },
        radius: data.circle_radius
      } : null;
      setMarker(m);
      setCoords(c);
      setCircle(ci);
      const group = drawRef.current;
      if (group) {
  group.clearLayers();
  if (m) {
    const markerLayer = L.marker([m.lat, m.lng]);
    group.addLayer(markerLayer);
  }
  if (c.length > 1) {
    const polyline = L.polyline(c.map(pt => [pt.lat, pt.lng]), { color: 'blue' });
    group.addLayer(polyline);
  }
  if (ci) {
    const circleLayer = L.circle(ci.center, { radius: ci.radius, color: 'red' });
    group.addLayer(circleLayer);
  }
}
      if (autoZoom) {
        setTimeout(() => zoomToFeatures(), 100);
      }
    }
  };

  useEffect(() => {
    if (selectedPassId) fetchDetails(selectedPassId);
  }, [selectedPassId]);

  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Marker) {
      const { lat, lng } = layer.getLatLng();
      setMarker({ lat, lng });
    }
    if (layer instanceof L.Polyline) {
      const points = layer.getLatLngs().map(p => ({ lat: p.lat, lng: p.lng }));
      setCoords(points);
    }
    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      setCircle({ center, radius });
    }
  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const { lat, lng } = layer.getLatLng();
        setMarker({ lat, lng });
      }
      if (layer instanceof L.Polyline) {
        const points = layer.getLatLngs().map(p => ({ lat: p.lat, lng: p.lng }));
        setCoords(points);
      }
      if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        setCircle({ center, radius });
      }
    });
  };

  const handleDeleted = () => {
    setMarker(null);
    setCoords([]);
    setCircle(null);
  };

  const handleSave = async () => {
    if (!selectedPassId) return;
    const updates = {
      marker_lat: marker?.lat || null,
      marker_lng: marker?.lng || null,
      coords: coords.map(c => [c.lat, c.lng]),
      circle_center_lat: circle?.center.lat || null,
      circle_center_lng: circle?.center.lng || null,
      circle_radius: circle?.radius || null
    };
    const { error } = await supabase.from('passes').update(updates).eq('id', selectedPassId);
    if (!error) alert("✅ Erfolgreich gespeichert.");
    else alert("❌ Fehler beim Speichern: " + error.message);
  };

  const filteredList = passList
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && (typeFilter === 'all' || p.type === typeFilter))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 280, background: '#2c2c2c', padding: 12, color: '#fff', overflowY: 'auto' }}>
        <h3>Pässe</h3>
        <input
          placeholder="🔍 Suche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        >
          <option value="all">Alle Typen</option>
          <option value="pass">Pass</option>
          <option value="road">Strasse</option>
          <option value="transit">Transit</option>
        </select>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredList.map((p) => (
            <li key={p.id}>
              <button
                style={{
                  width: '100%',
                  marginBottom: 6,
                  fontWeight: selectedPassId === p.id ? 'bold' : 'normal',
                  background: selectedPassId === p.id ? '#4a90e2' : '#3a3a3a',
                  color: '#fff',
                  border: 'none',
                  padding: 6
                }}
                onClick={() => {
  setSelectedPassId(p.id);
  const input = document.getElementById('searchbox');
  if (input) {
    input.value = p.name;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
  }
}}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[46.8, 8.3]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <FeatureGroup ref={drawRef}>
            <EditControl
              position="topright"
              draw={{
                marker: true,
                polyline: true,
                polygon: false,
                rectangle: false,
                circle: true,
                circlemarker: false,
              }}
              edit={{ edit: true, remove: true }}
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
            />
          </FeatureGroup>
          <SearchControl />
          {routingMode && <RoutePlanner onRouteReady={setCoords} />}
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          {Array.isArray(coords) && coords.length > 1 && (
            <Polyline positions={coords.map(c => [c.lat, c.lng])} color="blue" />
          )}
          {circle && <Circle center={circle.center} radius={circle.radius} pathOptions={{ color: 'red' }} />}
        </MapContainer>

        {true && (
          <div style={{ position: 'absolute', top: '50%', right: 10, zIndex: 1000, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setAutoZoom(prev => !prev)}
              title="Auto-Zoom"
              style={{ backgroundColor: autoZoom ? '#4caf50' : '#888', color: '#fff', border: 'none', padding: '6px 12px' }}
            >
              {autoZoom ? '🔍 Auto-Zoom: AN' : '🔍 Auto-Zoom: AUS'}
            </button>
            <button onClick={() => setRoutingMode(!routingMode)} title="Route planen">
              🧭 Route {routingMode ? 'beenden' : 'planen'}
            </button>
            <button
              onClick={() => {
                const group = drawRef.current;
                if (!group) return;
                if (marker) {
                  const existingMarker = L.marker([marker.lat, marker.lng]);
                  group.addLayer(existingMarker);
                }
                if (coords.length > 1) {
                  const polyline = L.polyline(coords.map(c => [c.lat, c.lng]), { color: 'blue' });
                  group.addLayer(polyline);
                }
                if (circle) {
                  const leafletCircle = L.circle(circle.center, { radius: circle.radius });
                  group.addLayer(leafletCircle);
                }
              }}
              title="Bearbeiten"
            >
              ✏️ Bearbeiten
            </button>
            <button
  onClick={handleSave}
  title="Speichern"
  style={{ backgroundColor: '#4a90e2', color: '#fff', border: 'none', padding: '6px 12px' }}
>
  💾 Speichern
</button>
<button
  onClick={() => {
    setCoords(prev => prev.slice(0, -1));
  }}
  title="Letzten Punkt entfernen"
  style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '6px 12px' }}
>
  ↩️ Letzten Punkt entfernen
</button>
            
          </div>
        )}
      </div>
    </div>
  );
}
