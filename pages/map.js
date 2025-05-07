// /pages/map.js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAppContext } from "../contexts/AppContext";
import Roads from "../components/roads";
import SidebarMap from "../components/sidebarmap";
import SidebarMapMobile from "../components/sidebarmapmobile";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), {
  ssr: false,
});

export default function MapPage() {
  const router = useRouter();
  const { language, darkMode } = useAppContext();
  const [selectedPass, setSelectedPass] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoZoom, setAutoZoom] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    filteredPasses,
    favorites,
    toggleFavorite,
    searchTerm,
    setSearchTerm,
    legendFilters,
    toggleLegendFilter,
  } = Roads();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // ← Sidebar-Status abhängig vom Gerät
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const legendKeys = ["closed", "open", "low", "transit", "scenic"];
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
      transit: "Autobahn",
      scenic: "Aussicht",
      autoZoom: "Auto-Zoom",
      allStatus: "Alle Status",
      allCountries: "Alle Länder",
      allRegions: "Alle Regionen",
      allTypes: "Alle Typen",
      favOnly: "Nur Favoriten",
      search: "Suchen...",
      list: "Liste",
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
      list: "List",
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
      list: "Liste",
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
      list: "Lista",
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

      {/* Sidebar */}
      {isMobile ? (
        <SidebarMapMobile
          darkMode={darkMode}
          language={language}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          legendText={legendText}
          filteredPasses={filteredPasses}
          selectedPass={selectedPass}
          setSelectedPass={setSelectedPass}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      ) : (
        <SidebarMap
          darkMode={darkMode}
          language={language}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          legendText={legendText}
          filteredPasses={filteredPasses}
          selectedPass={selectedPass}
          setSelectedPass={setSelectedPass}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <LeafletMap
          passes={filteredPasses}
          selectedPass={selectedPass}
          autoZoom={autoZoom}
          centerOffset={{ x: -0.1 , y: 0.05 }}
          setSelectedPass={setSelectedPass}
        />
      </div>
    </div>
  );
}
