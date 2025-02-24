
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import CreateEvent from "@/pages/CreateEvent";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import AdminAuth from "@/pages/AdminAuth";
import AdminDashboard from "@/pages/AdminDashboard";
import GroomerAuth from "@/pages/GroomerAuth";
import GroomerDashboard from "@/pages/GroomerDashboard";
import GroomerOnboarding from "@/pages/GroomerOnboarding";
import VetAuth from "@/pages/VetAuth";
import VetDashboard from "@/pages/VetDashboard";
import VetOnboarding from "@/pages/VetOnboarding";
import FindVets from "@/pages/FindVets";
import ConsultationChat from "@/pages/ConsultationChat";
import PetGroomingIndex from "@/pages/pet-grooming";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/groomer-auth" element={<GroomerAuth />} />
        <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
        <Route path="/groomer-onboarding" element={<GroomerOnboarding />} />
        <Route path="/vet-auth" element={<VetAuth />} />
        <Route path="/vet-dashboard" element={<VetDashboard />} />
        <Route path="/vet-onboarding" element={<VetOnboarding />} />
        <Route path="/find-vets" element={<FindVets />} />
        <Route path="/consultation/:id" element={<ConsultationChat />} />
        <Route path="/pet-grooming" element={<PetGroomingIndex />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
