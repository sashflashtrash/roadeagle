import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppContextProvider({ children }) {
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
    <AppContext.Provider value={{ language, setLanguage, darkMode, setDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
