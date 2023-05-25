import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./navbar";
import Live from "../pages/live/live";
import TrailGroupInfo from "../pages/trek/trail";
import DeletePage from "../pages/delete/delete"


function AppRouter() {
  return (
    <Router>
        <Navbar/>
        <Routes>
            <Route path="/" element={<Live />} />
            <Route path="/live" element={<Live />} />
            <Route path="/trail" element={ <TrailGroupInfo /> } />
            <Route path="/delete" element={ <DeletePage /> } />
        </Routes>
    </Router>
  );
}

export default AppRouter;