// /components/SidebarMapMobile.js
import { useRef, useEffect } from "react";

export default function SidebarMapMobile({
  darkMode,
  language,
  sidebarOpen,
  setSidebarOpen,
  searchTerm,
  setSearchTerm,
  legendText,
  filteredPasses,
  selectedPass,
  setSelectedPass,
  favorites,
  toggleFavorite,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current?.querySelector("li.selected");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedPass]);

  useEffect(() => {
    let startY = 0;
    const onStart = (e) => { startY = e.touches[0].clientY; };
    const onMove = (e) => {
      const deltaY = startY - e.touches[0].clientY;
      if (deltaY > 70 && !sidebarOpen) setSidebarOpen(true);
      if (deltaY < -70 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Toggle Lasche */}
      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          left: "50%",
          bottom: sidebarOpen ? "65%" : 0,
          transform: "translateX(-50%)",
          padding: "4px 12px",
          borderRadius: 12,
          background: "#0070f3",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
          zIndex: 1101,
        }}
      >
        {legendText[language].list}
      </div>

      {/* Bottom Sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: sidebarOpen ? 0 : "-65%",
          height: "65%",
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#eee" : "#000",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          zIndex: 1000,
          padding: 12,
          transition: "bottom 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={legendText[language].search}
          style={{
            padding: 6,
            borderRadius: 4,
            border: "1px solid #ccc",
            marginBottom: 8,
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />
        <div className="scrollList" style={{ overflowY: "auto", flexGrow: 1 }} ref={listRef}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredPasses.sort((a, b) => a.name.localeCompare(b.name)).map((pass) => (
              <li
                key={pass.id || pass.name}
                className={selectedPass?.name === pass.name ? "selected" : ""}
                onClick={() => setSelectedPass(pass)}
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
        </div>
      </div>
    </>
  );
}
