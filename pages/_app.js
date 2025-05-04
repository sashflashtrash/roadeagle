import "@/styles/globals.css";
import { AppContextProvider } from "../contexts/AppContext";
import Navbar from "../components/Navbar";
import { useAppContext } from "../contexts/AppContext";
import { useEffect } from "react";

function AppWithDarkMode({ children }) {
  const { darkMode } = useAppContext();

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
    document.body.style.color = darkMode ? "#e0e0e0" : "#222222";
  }, [darkMode]);

  return children;
}

export default function App({ Component, pageProps }) {
  return (
    <AppContextProvider>
      <AppWithDarkMode>
        <Navbar />
        <div style={{ paddingTop: "60px" }}>
          <Component {...pageProps} />
        </div>
      </AppWithDarkMode>
    </AppContextProvider>
  );
}
