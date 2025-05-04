// /pages/map.js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAppContext } from "../contexts/AppContext";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), {
  ssr: false,
});

export default function MapPage({ passes }) {
  const router = useRouter();
  const { language, darkMode } = useAppContext();
  const [selectedPass, setSelectedPass] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [autoZoom, setAutoZoom] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [legendFilters, setLegendFilters] = useState({
  closed: true,
  open: true,
  low: true,
  transit: true,
  scenic: true,
});

  const toggleLegendFilter = (key) => {
    setLegendFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFavorite = (name) => {
    const updated = favorites.includes(name)
      ? favorites.filter((n) => n !== name)
      : [...favorites, name];
    setFavorites(updated);
    localStorage.setItem("beyond_favorites", JSON.stringify(updated));
  };

  useEffect(() => {
    const stored = localStorage.getItem("beyond_favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const filteredPasses = passes.filter((pass) => {
    const nameMatch = pass.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "all" || pass.status === filterStatus;
    const typeMatch = filterType === "all" || pass.type === filterType;
    const countryMatch = filterCountry === "all" || pass.countries.includes(filterCountry);
    const regionMatch = filterRegion === "all" || pass.region === filterRegion;
    const favMatch = !favoritesOnly || favorites.includes(pass.name);
    const legendMatch = Object.values(legendFilters).some(Boolean)
      ? (pass.type === 'pass' ? legendFilters[pass.status] : legendFilters[pass.type === 'road' ? 'low' : pass.type])
      : false;
    return nameMatch && statusMatch && countryMatch && regionMatch && typeMatch && favMatch && !pass.hidden && legendMatch;
  });

  const legendKeys = ["closed", "open", "low", "transit", "scenic"];

  // Farben zuordnen für legendButtons, wenn aktiv
  const legendColors = {
    closed: "red",
    open: "green",
    low: "blue",
    transit: "gold",
    scenic: "orange",
  };

  const legendText = {
    DE: {
      closed: "Pass zu",
      open: "Pass auf",
      low: "Strassen",
      transit: "Transit",
      scenic: "Aussicht",
      autoZoom: "Auto-Zoom",
      allStatus: "Alle Status",
      allCountries: "Alle Länder",
      allRegions: "Alle Regionen",
      allTypes: "Alle Typen",
      favOnly: "Nur Favoriten",
      search: "Suchen...",
    },
    EN: {
      closed: "Pass closed",
      open: "Pass open",
      low: "Flat road",
      transit: "Highway",
      scenic: "Scenic",
      autoZoom: "Auto-Zoom",
      allStatus: "All Status",
      allCountries: "All Countries",
      allRegions: "All Regions",
      allTypes: "All Types",
      favOnly: "Favorites only",
      search: "Search...",
    },
    FR: {
      closed: "Col fermé",
      open: "Col ouvert",
      low: "Rue",
      transit: "Autoroute",
      scenic: "Panoramique",
      autoZoom: "Zoom auto",
      allStatus: "Tous les statuts",
      allCountries: "Tous les pays",
      allRegions: "Toutes les régions",
      allTypes: "Tous les types",
      favOnly: "Favoris seulement",
      search: "Rechercher...",
    },
    IT: {
      closed: "Passo chiuso",
      open: "Passo aperto",
      low: "Strada",
      transit: "Autostrada",
      scenic: "Panoramico",
      autoZoom: "Zoom automatico",
      allStatus: "Tutti gli stati",
      allCountries: "Tutti i paesi",
      allRegions: "Tutte le regioni",
      allTypes: "Tutti i tipi",
      favOnly: "Solo preferiti",
      search: "Cerca...",
    },
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Navbar />

      {/* Legende */}
      <div style={{ position: "fixed", top: "70px", right: "20px", backgroundColor: darkMode ? "#333" : "rgba(255,255,255,0.9)", color: darkMode ? "#eee" : "#000", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", lineHeight: "1.5", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 1100 }}>
        <button
          onClick={() => setAutoZoom(!autoZoom)}
          style={{ marginBottom: "8px", padding: "4px 8px", borderRadius: "4px", backgroundColor: autoZoom ? "#0070f3" : "#aaa", color: "white", border: "none", cursor: "pointer", fontSize: "13px" }}
        >
          {legendText[language].autoZoom}: {autoZoom ? "On" : "Off"}
        </button>
        {legendKeys.map((key) => (
          <div key={key}>
            <button
              onClick={() => toggleLegendFilter(key)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px 8px',
                marginBottom: '6px',
                cursor: 'pointer',
                color: darkMode ? '#fff' : '#000',
                fontWeight: 'normal',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <span style={{ color: legendFilters[key] ? legendColors[key] : '#999', fontWeight: 'bold' }}>⬤</span> {legendText[language][key]}
            </button>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', top: '60px', left: sidebarOpen ? 0 : '-260px', width: '260px', bottom: '0', backgroundColor: darkMode ? '#1e1e1e' : '#fff', color: darkMode ? '#eee' : '#000', zIndex: 1000, boxShadow: '2px 0 8px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '10px', transition: 'left 0.3s ease, border-radius 0.3s ease', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
        <div style={{ direction: 'ltr', marginBottom: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={legendText[language].search}
            style={{
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: darkMode ? '#2a2a2a' : '#fff',
              color: darkMode ? '#fff' : '#000',
              width: '100%'
            }}
          />
        </div>
        <div className="scrollList" style={{ overflowY: 'auto', flexGrow: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <ul style={{ listStyle: 'none', padding: 0, direction: 'ltr' }}>
          {filteredPasses.sort((a, b) => a.name.localeCompare(b.name)).map((pass) => (
            <li key={pass.id || pass.name} ref={el => selectedPass?.name === pass.name ? el?.scrollIntoView({ block: 'center', behavior: 'smooth' }) : null} onClick={() => setSelectedPass(pass)} style={{
              borderBottom: '1px solid #ddd',
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: selectedPass?.name === pass.name ? 'bold' : 'normal',
              backgroundColor: selectedPass?.name === pass.name ? (darkMode ? '#444' : '#eee') : 'transparent'
            }}>
              <span>{pass.name}</span>
              <span onClick={(e) => { e.stopPropagation(); toggleFavorite(pass.name); }} style={{ color: favorites.includes(pass.name) ? 'gold' : '#aaa', fontSize: '18px' }}>★</span>
            </li>
          ))}
        </ul>
        </div>
      </div>

      <style jsx>{`
        .scrollList::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', top: '60px', left: sidebarOpen ? '276px' : '16px', transition: 'left 0.3s ease', width: '36px', height: '36px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '2px 2px 6px rgba(0,0,0,0.2)', zIndex: 1101 }}>
        ☰
      </div>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <LeafletMap passes={filteredPasses} selectedPass={selectedPass} autoZoom={autoZoom} centerOffset={{ x: -0.1 , y: 0.05 }} />
      </div>
    </div>
  );
}

import { supabase } from "../lib/supabaseClient";

export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("passes")
    .select("id, name, status, countries, region, type, marker_lat, marker_lng, coords, hidden");

  if (error) {
    console.error("Supabase-Fehler:", error);
    return { props: { passes: [] } };
  }

  return {
    props: { passes: data },
  };
}
