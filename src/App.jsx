import React from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import DonorDashboard from "./pages/DonorDashboard.jsx";
import NGODashboard from "./pages/NGODashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { getUserFromToken, logout } from "./services/api.js";

function AppLayout() {
  const navigate = useNavigate();
  const user = getUserFromToken();

  return (
    <div className="appShell">
      <Navbar
        logoText="ShareMeal"
        role={user?.role}
        onLogout={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
      <main className="appMain">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RootRedirect() {
  const user = getUserFromToken();
  return (
    <Navigate
      to={user?.role === "ngo" ? "/ngo" : user?.role === "donor" ? "/donor" : "/login"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route element={<ProtectedRoute requiredRole="donor" />}>
          <Route path="/donor" element={<DonorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="ngo" />}>
          <Route path="/ngo" element={<NGODashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
