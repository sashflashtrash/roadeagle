// SidebarMapMobile
import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";

export default function SidebarMapMobile({
  darkMode,
  language,
  searchTerm,
  setSearchTerm,
  filteredPasses,
  selectedPass,
  setSelectedPass,
  favorites,
  toggleFavorite,
  setOverlayOpen,
  isMobile
}) {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const latestController = useRef(null);
  const [activeTab, setActiveTab] = useState("list");
  const [overlayOpen, setOverlayOpenState] = useState(false);
  const [villageResults, setVillageResults] = useState([]);
  const [villageQuery, setVillageQuery] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const el = listRef.current?.querySelector("li.selected");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedPass]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setVillageResults([]);
      return;
    }

    if (latestController.current) {
      latestController.current.abort();
    }

    const controller = new AbortController();
    latestController.current = controller;

    const fetchData = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&addressdetails=1&limit=5`, {
          signal: controller.signal
        });
        const data = await res.json();
        setVillageResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    };

    const debouncedFetch = debounce(fetchData, 300);
    debouncedFetch();

    return () => {
      controller.abort();
      debouncedFetch.cancel();
    };
  }, [searchTerm]);

  const handleOverlayToggle = (state) => {
    setOverlayOpenState(state);
    setOverlayOpen(state);
    if (state && inputRef.current) {
      setTimeout(() => inputRef.current.select(), 0);
    }
  };

  const handleVillageSelect = (village) => {
    setVillageQuery(village);
    setSearchTerm(village.display_name);
    handleOverlayToggle(false);

    const newEntry = village.display_name;
    setRecentSearches(prev => {
      const filtered = prev.filter(v => v !== newEntry);
      return [newEntry, ...filtered].slice(0, 5);
    });

    if (typeof window !== 'undefined' && village.lat && village.lon && window.leafletMapRef) {
      const map = window.leafletMapRef;
      map.setView([parseFloat(village.lat), parseFloat(village.lon)], 14);
    }
  };

  const formatVillageDisplayName = (displayName) => {
    const parts = displayName.split(",");
    return parts.filter((_, i) => i !== 1 && i !== 3).join(",");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 48,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        }}
      >
        <input
          type="text"
          placeholder={language === "DE" ? "Ortschaft suchen..." : "Search village..."}
          onFocus={() => handleOverlayToggle(true)}
          readOnly
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            cursor: "pointer",
          }}
        />
      </div>

      <div
        style={{
          position: "fixed",
          top: 48,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#eee" : "#000",
          zIndex: 1000,
          padding: 12,
          transition: "bottom 0.3s ease",
          display: overlayOpen ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === "DE" ? "Suche Ortschaft" : "Search village"}
          autoFocus
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #ccc",
            marginBottom: 8,
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />

        {villageResults.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 12 }}>
            {villageResults.map((village) => (
              <li
                key={village.place_id}
                onClick={() => handleVillageSelect(village)}
                style={{
                  padding: "8px 4px",
                  borderBottom: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                {formatVillageDisplayName(village.display_name)}
              </li>
            ))}
          </ul>
        )}

        {recentSearches.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 6, fontWeight: "bold" }}>{language === "DE" ? "Zuletzt gesucht:" : "Recent Searches:"}</div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {recentSearches.map((name, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSearchTerm(name);
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  style={{
                    padding: "6px 4px",
                    borderBottom: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  {formatVillageDisplayName(name)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => handleOverlayToggle(false)}
          style={{
            marginTop: 12,
            padding: 8,
            borderRadius: 8,
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Schließen
        </button>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 16 }}>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              flex: 1,
              padding: 8,
              borderBottom: activeTab === "list" ? "2px solid #0070f3" : "1px solid #ccc",
              background: "none",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            Liste
          </button>
          <button
            onClick={() => setActiveTab("places")}
            style={{
              flex: 1,
              padding: 8,
              borderBottom: activeTab === "places" ? "2px solid #0070f3" : "1px solid #ccc",
              background: "none",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            Orte
          </button>
        </div>

        {/* Inhalt */}
        <div className="scrollList" style={{ overflowY: "auto", flexGrow: 1 }} ref={listRef}>
          {activeTab === "list" && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {filteredPasses
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((pass) => (
                  <li
                    key={pass.id || pass.name}
                    className={selectedPass?.name === pass.name ? "selected" : ""}
                    onClick={() => {
                      setSelectedPass(pass);
                      handleOverlayToggle(false);
                    }}
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: selectedPass?.name === pass.name ? "bold" : "normal",
                      backgroundColor:
                        selectedPass?.name === pass.name
                          ? darkMode
                            ? "#444"
                            : "#eee"
                          : "transparent",
                    }}
                  >
                    <span>{pass.name}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(pass.id);
                      }}
                      style={{
                        color: favorites.includes(pass.id) ? "gold" : "#aaa",
                        fontSize: 18,
                        cursor: "pointer",
                      }}
                    >
                      ★
                    </span>
                  </li>
                ))}
            </ul>
          )}
          {activeTab === "places" && (
            <div>
              <p style={{ opacity: 0.5, fontStyle: "italic" }}>Keine weiteren Inhalte.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
