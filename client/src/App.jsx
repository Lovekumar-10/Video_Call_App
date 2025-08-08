import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import Room from "./pages/Room"; 
import Leave from "./pages/Leave";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />  
        <Route path="/leave" element={<Leave />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
