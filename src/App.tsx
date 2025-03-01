
import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import "./App.css";

// Import pages
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import GroomerAuth from "./pages/GroomerAuth";
import GroomerOnboarding from "./pages/GroomerOnboarding";
import GroomerPending from "./pages/GroomerPending";
import GroomerDashboard from "./pages/GroomerDashboard";
import VetAuth from "./pages/VetAuth";
import VetOnboarding from "./pages/VetOnboarding";
import VetDashboard from "./pages/VetDashboard";
import FindVets from "./pages/FindVets";
import ConsultationChat from "./pages/ConsultationChat";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";

// Import blog pages
import BlogHome from "./pages/blog";
import BlogPost from "./pages/blog/BlogPost";
import CategoryPage from "./pages/blog/CategoryPage";

// Import pet grooming pages
import PetGrooming from "./pages/pet-grooming";
import GroomerDetail from "./pages/pet-grooming/GroomerDetail";
import GroomerBooking from "./pages/pet-grooming/GroomerBooking";

// Wrapper component to handle the redirection
const GroomerRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/pet-grooming/${id}`} replace />;
};

// Admin redirect component
const AdminRedirect = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

// Forgot password redirect
const ForgotPasswordRedirect = () => {
  return <Navigate to="/auth" replace />;
};

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Home Route */}
      <Route path="/" element={<Index />} />
      
      {/* Event Routes */}
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />
      
      {/* Auth Routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPasswordRedirect />} />
      <Route path="/reset-password" element={<Auth />} />
      <Route path="/groomer-auth" element={<GroomerAuth />} />
      <Route path="/groomer-onboarding" element={<GroomerOnboarding />} />
      <Route path="/groomer-pending" element={<GroomerPending />} />
      <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
      <Route path="/vet-auth" element={<VetAuth />} />
      <Route path="/vet-onboarding" element={<VetOnboarding />} />
      <Route path="/vet-dashboard" element={<VetDashboard />} />
      <Route path="/find-vets" element={<FindVets />} />
      <Route path="/consultation/:id" element={<ConsultationChat />} />
      
      {/* Admin Routes - make sure paths match with what AdminAuth.tsx uses */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/auth" element={<AdminAuth />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin-auth" element={<AdminAuth />} /> {/* Keep for backward compatibility */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Keep for backward compatibility */}
      
      {/* User Routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      
      {/* Legal Routes */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/cancellation-policy" element={<CancellationPolicy />} />
      
      {/* Blog Routes */}
      <Route path="/blog" element={<BlogHome />} />
      <Route path="/blog/post/:slug" element={<BlogPost />} />
      <Route path="/blog/category/:category" element={<CategoryPage />} />
      
      {/* Pet Grooming Routes */}
      <Route path="/pet-grooming" element={<PetGrooming />} />
      <Route path="/pet-grooming/:id" element={<GroomerDetail />} />
      <Route path="/pet-grooming/:id/booking" element={<GroomerBooking />} />
      
      {/* Redirect groomer links to pet-grooming */}
      <Route path="/groomer/:id" element={<GroomerRedirect />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
