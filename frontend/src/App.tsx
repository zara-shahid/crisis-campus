import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Checklist from "./pages/Checklist";
import CommunityBoard from "./pages/CommunityBoard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/community" element={<CommunityBoard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}