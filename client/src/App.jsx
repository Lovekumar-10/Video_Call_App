
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import ReactGA from "react-ga4";   // Google Analytics
import Home from "./pages/Home"; 
import Room from "./pages/Room"; 
import Leave from "./pages/Leave";


ReactGA.initialize("G-SQ58ZBDWNC");

function App() {
  const location = useLocation();


  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<Room />} />  
      <Route path="/leave" element={<Leave />} /> 
    </Routes>
  );
}


export default function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
