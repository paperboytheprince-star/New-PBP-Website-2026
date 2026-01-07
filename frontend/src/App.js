import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Events from "./pages/Events";
import ActionCenter from "./pages/ActionCenter";
import About from "./pages/About";
import Films from "./pages/Films";
import Music from "./pages/Music";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminModeration from "./pages/AdminModeration";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

// External redirect component for Shop
const ShopRedirect = () => {
  window.location.href = 'https://paperboyprince.shop';
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="action" element={<ActionCenter />} />
            <Route path="about" element={<About />} />
            <Route path="films" element={<Films />} />
            <Route path="music" element={<Music />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/shop" element={<ShopRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Redirect old admin login to regular login */}
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
