import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import Menu from "./components/menu/menu";
import Inventory from "./components/inventory/inventory";
import Bill from "./components/billing/billing";
import Reports from "./components/report/reports";
import EditBill from "./components/editbills/editbill";
import SearchBill from "./components/searchbills/searchbills";
import Auth from "./auth/login/auth";
import './alert.js';

import "./App.css";

// localStorage.removeItem("token");

function Layout() {


  useEffect(() => {
    document.title = process.env.REACT_APP_ORGANIZATION_NAME || "Stockify Inventory System";
  }, []);
  const location = useLocation();

  // 👇 login page par menu hide
  const hideMenu = location.pathname === "/login";

  return (
    <div className="App">
      {!hideMenu && <Menu />}

      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Inventory />} />
        <Route path="/search-bill" element={<SearchBill />} />
        <Route path="/billing" element={<Bill />} />
        <Route path="/edit-bill/:id" element={<EditBill />} />

        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;