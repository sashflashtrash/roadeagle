import { useAppContext } from "../contexts/AppContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { language, setLanguage, darkMode, setDarkMode } = useAppContext();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const flagImages = {
    DE: "/images/flags/de.png",
    EN: "/images/flags/gb.png",
    IT: "/images/flags/it.png",
    FR: "/images/flags/fr.png",
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  const toggleExpanded = () => {
    if (isMobile) setExpanded(!expanded);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      height: "60px",
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)",
      color: darkMode ? "#ffffff" : "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 1000,
      backdropFilter: "blur(6px)",
      borderRadius: "0 0 12px 12px",
    }}>

      {/* Sprachflaggen */}
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
      >
        <img
          src={flagImages[language]}
          alt={language}
          onClick={toggleExpanded}
          style={{
            height: "28px",
            width: "auto",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "transform 0.2s",
          }}
        />

        <div style={{
          position: "absolute",
          left: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          gap: "8px",
          opacity: expanded ? 1 : 0,
          visibility: expanded ? "visible" : "hidden",
          transition: "all 0.3s ease",
        }}>
          {Object.entries(flagImages)
            .filter(([key]) => key !== language)
            .map(([key, src]) => (
              <img
                key={key}
                src={src}
                alt={key}
                onClick={() => {
                  setLanguage(key);
                  setExpanded(false);
                }}
                style={{
                  height: "24px",
                  width: "auto",
                  cursor: "pointer",
                  borderRadius: "4px",
                  boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            ))}
        </div>
      </div>

      {/* Zentrale Gruppe: Button + Titel */}
      <div
        onClick={() => router.push("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "pointer",
        }}
      >
        <img
          src="/images/adler1.png"
          alt="Startseite"
          style={{
            height: "36px",
            width: "auto",
            borderRadius: "6px",
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <span style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: darkMode ? "#00ccff" : "#003366",
          userSelect: "none",
        }}>
          Road Eagle/testversion
        </span>
      </div>

      {/* Darkmode */}
      <div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "6px 12px",
            backgroundColor: darkMode ? "#444" : "#ccc",
            color: darkMode ? "#fff" : "#000",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
}
