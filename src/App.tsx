
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import GroomerAuth from "./pages/GroomerAuth";
import GroomerOnboarding from "./pages/GroomerOnboarding";
import GroomerPending from "./pages/GroomerPending";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import FindVets from "./pages/FindVets";
import VetAuth from "./pages/VetAuth";
import VetOnboarding from "./pages/VetOnboarding";
import VetDashboard from "./pages/VetDashboard";
import ConsultationChat from "./pages/ConsultationChat";
import GroomerDashboard from "./pages/GroomerDashboard";
import BlogIndex from "./pages/blog";
import BlogPost from "./pages/blog/BlogPost";
import CategoryPage from "./pages/blog/CategoryPage";
import PetGroomingIndex from "./pages/pet-grooming";
import GroomerDetail from "./pages/pet-grooming/GroomerDetail";
import GroomerBooking from "./pages/pet-grooming/GroomerBooking";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin-auth" element={<AdminAuth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events/edit/:id" element={<EditEvent />} />
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        <Route path="/groomer-auth" element={<GroomerAuth />} />
        <Route path="/groomer-onboarding" element={<GroomerOnboarding />} />
        <Route path="/groomer-pending" element={<GroomerPending />} />
        <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/find-vets" element={<FindVets />} />
        <Route path="/vet-auth" element={<VetAuth />} />
        <Route path="/vet-onboarding" element={<VetOnboarding />} />
        <Route path="/vet-dashboard" element={<VetDashboard />} />
        <Route path="/consultation/:id" element={<ConsultationChat />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/blog/category/:category" element={<CategoryPage />} />
        <Route path="/pet-grooming" element={<PetGroomingIndex />} />
        <Route path="/pet-grooming/:id" element={<GroomerDetail />} />
        <Route path="/pet-grooming/booking/:id" element={<GroomerBooking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner position="top-right" />
    </>
  );
}

export default App;
