// LeafletMap.js
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "/pin.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
});
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

function ZoomToPass({ selectedPass, autoZoom, centerOffset, setSelectPass }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPass && selectedPass.marker_lat && selectedPass.marker_lng && autoZoom) {
      const latOffset = centerOffset?.y || 0;
      const lngOffset = centerOffset?.x || 0;
      const lat = selectedPass.marker_lat + latOffset;
      const lng = selectedPass.marker_lng + lngOffset;
      map.setView([lat, lng], 11);
    }
  }, [selectedPass, autoZoom, centerOffset, map]);
  return null;
}

export default function LeafletMap({ passes, selectedPass, autoZoom, centerOffset, setSelectedPass }) {
  return (
    <MapContainer
      center={[47.0, 8.0]}
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {selectedPass && selectedPass.marker_lat && selectedPass.marker_lng && (
        <Marker key={selectedPass.id} position={[selectedPass.marker_lat, selectedPass.marker_lng]} icon={customIcon}>
          <Popup>
            <strong>{selectedPass.name}</strong>
          </Popup>
        </Marker>
      )}

      {passes.map((pass) => (
        pass.coords && pass.coords.length > 1 && (
          <Polyline
            key={pass.id + "_line"}
            positions={Array.isArray(pass.coords) ? pass.coords : []}
            pathOptions={{
              color:
                pass.status === "open" ? "green" :
                pass.status === "closed" ? "red" :
                pass.type === "transit" ? "gold" :
                pass.type === "road" ? "blue" :
                pass.type === "scenic" ? "orange" :
                "gray",
              weight: 4,
            }}
            eventHandlers={{
              click: () => {
                console.log("Polyline clicked:", pass.name);
                const found = passes.find(p => p.id === pass.id || p.name === pass.name);
                if (found && setSelectedPass) setSelectedPass(found);
              }
            }}
          />
        )
      ))}

      <ZoomToPass selectedPass={selectedPass} autoZoom={autoZoom} centerOffset={centerOffset} />
    </MapContainer>
  );
}
