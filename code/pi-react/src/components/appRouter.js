import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./navbar";
import Live from "../pages/live/live";
import TrailGroupInfo from "../pages/trek/trail";
import Test from "../pages/test";


function AppRouter() {
  return (
    <Router>
        <Navbar/>
        <Routes>
            <Route path="/" element={<Live />} />
            <Route path="/live" element={<Live />} />
            <Route path="/trail" element={ <TrailGroupInfo /> }
            />
        </Routes>
    </Router>
  );
}

export default AppRouter;