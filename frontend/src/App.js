import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { initAnalytics } from "./lib/analytics";
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
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminModeration from "./pages/AdminModeration";
import AdminAnalytics from "./pages/AdminAnalytics";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

// External redirect component for Shop
const ShopRedirect = () => {
  window.location.href = 'https://paperboyprince.shop';
  return null;
};

// Google Form redirect for volunteer signup
const VolunteerRedirect = () => {
  window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScZbG2bCzNGf6AAaYzV9y8d9aVOJxct7El-m1MT92IlkDOy0w/viewform?usp=preview';
  return null;
};

function App() {
  // Initialize analytics on app mount
  useEffect(() => {
    initAnalytics();
  }, []);

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
            <Route path="posts" element={<Posts />} />
            <Route path="posts/:id" element={<PostDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/shop" element={<ShopRedirect />} />
          {/* Volunteer/Join routes redirect to Google Form */}
          <Route path="/join" element={<VolunteerRedirect />} />
          <Route path="/volunteer" element={<VolunteerRedirect />} />
          <Route path="/register" element={<VolunteerRedirect />} />
          {/* Admin login still available */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Redirect old admin login to regular login */}
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
