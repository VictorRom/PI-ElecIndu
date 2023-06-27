import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./navbar";
import Live from "../pages/live/live";
import TrailGroupInfo from "../pages/trek/trail";
import DeletePage from "../pages/delete/delete"


function AppRouter() {
  const [proto, setProto] = useState("1");

  const handlePrototypeChange = (newOption) => {
    setProto(newOption);
    // Faire des actions spécifiques pour le dropdown 1 ici
  };
  return (
    <Router>
        <Navbar handlePrototypeChange={handlePrototypeChange} />
        <Routes>
            <Route path="/" element={<Live proto={proto}/>} />
            <Route path="/live" element={<Live proto={proto}/>} />
            <Route path="/trail" element={ <TrailGroupInfo proto={proto}/> } />
            <Route path="/delete" element={ <DeletePage proto={proto}/> } />
        </Routes>
    </Router>
  );
}

export default AppRouter;