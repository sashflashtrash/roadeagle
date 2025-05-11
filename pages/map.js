import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useAppContext } from "../contexts/AppContext";
import Roads from "../components/roads";
import SidebarMap from "../components/SidebarMap";
import SidebarMapMobile from "../components/SidebarMapMobile";
import LegendMap from "../components/LegendMap";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), {
  ssr: false,
});

const LeafletMapMobile = dynamic(() => import("../components/LeafletMapMobile"), {
  ssr: false,
});

export default function MapPage() {
  const router = useRouter();
  const { language, darkMode } = useAppContext();
  const [selectedPass, setSelectedPass] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoZoom, setAutoZoom] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const mapRef = useRef(null);

  const {
    passes,
    filteredPasses,
    mapFilteredPasses,
    favorites,
    toggleFavorite,
    searchTerm,
    setSearchTerm,
    legendFilters,
    toggleLegendFilter,
    resetFilters,
    selectedCountries,
    setSelectedCountries,
    selectedLevel,
    setSelectedLevel
  } = Roads();

  useEffect(() => {
    const handleResize = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleAutozoomToPass = (pass) => {
    if (typeof window === 'undefined') return;
    if (autoZoom && pass?.coords?.length) {
      import('leaflet').then(L => {
        const bounds = L.latLngBounds(pass.coords);
        mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
      }).catch(err => console.error("Leaflet import error:", err));
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", height: "100vh", overflow: "hidden", position: "relative" }}>
      <Navbar />

      {isMobile ? (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <LeafletMapMobile
              darkMode={darkMode}
              passes={mapFilteredPasses}
              selectedPass={selectedPass}
              autoZoom={autoZoom}
              setSelectedPass={setSelectedPass}
              mapRef={mapRef}
              isMobile={true}
              overlayOpen={overlayOpen}
            />
          </div>
          <SidebarMapMobile
            darkMode={darkMode}
            language={language}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredPasses={filteredPasses}
            selectedPass={selectedPass}
            setSelectedPass={setSelectedPass}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setOverlayOpen={setOverlayOpen}
            isMobile={true}
          />
        </>
      ) : (
        <>
          <SidebarMap
            darkMode={darkMode}
            language={language}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredPasses={filteredPasses}
            selectedPass={selectedPass}
            setSelectedPass={setSelectedPass}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            legendFilters={legendFilters}
            toggleLegendFilter={toggleLegendFilter}
            resetFilters={resetFilters}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            passes={passes}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            autozoom={autoZoom}
            setAutozoom={setAutoZoom}
            handleAutozoomToPass={handleAutozoomToPass}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <LeafletMap
              darkMode={darkMode}
              passes={mapFilteredPasses}
              selectedPass={selectedPass}
              autoZoom={autoZoom}
              centerOffset={{ x: -0.1 , y: 0.05 }}
              setSelectedPass={setSelectedPass}
              mapRef={mapRef}
            />
          </div>
          <LegendMap
            autozoom={autoZoom}
            setAutozoom={setAutoZoom}
            legendFilters={legendFilters}
            toggleLegendFilter={toggleLegendFilter}
            darkMode={darkMode}
          />
        </>
      )}
    </div>
  );
}
