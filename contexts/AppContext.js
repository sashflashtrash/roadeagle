
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const legendText = {
  de: {
    legend: "Legende",
    autoZoom: "Autozoom",
    labels: {
      open: "🟢 Pass offen",
      closed: "🔴 Pass zu",
      route: "🔵 Routen",
      tour: "🟡 Tour",
      poi: "🟠 Sehenswürdigkeit"
    }
  },
  en: {
    legend: "Legend",
    autoZoom: "Autozoom",
    labels: {
      open: "🟢 Pass open",
      closed: "🔴 Pass closed",
      route: "🔵 Routes",
      tour: "🟡 Tour",
      poi: "🟠 Scenic spot"
    }
  },
  fr: {
    legend: "Légende",
    autoZoom: "Zoom auto",
    labels: {
      open: "🟢 Col ouvert",
      closed: "🔴 Col fermé",
      route: "🔵 Itinéraires",
      tour: "🟡 Tour",
      poi: "🟠 Point d'intérêt"
    }
  },
  it: {
    legend: "Legenda",
    autoZoom: "Zoom automatico",
    labels: {
      open: "🟢 Passo aperto",
      closed: "🔴 Passo chiuso",
      route: "🔵 Percorsi",
      tour: "🟡 Tour",
      poi: "🟠 Punto panoramico"
    }
  }
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useState("EN");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    const savedMode = localStorage.getItem("darkMode");
    if (savedLang) setLanguage(savedLang);
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    localStorage.setItem("darkMode", darkMode);
  }, [language, darkMode]);

  return (
    <AppContext.Provider value={{ language, setLanguage, darkMode, setDarkMode, legendText }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
export const AppWrapper = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);
