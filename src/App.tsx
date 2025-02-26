
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VetOnboarding from "./pages/VetOnboarding";
import VetAuth from "./pages/VetAuth";
import VetDashboard from "./pages/VetDashboard";
import FindVets from "./pages/FindVets";
import ConsultationChat from "./pages/ConsultationChat";
import GroomerAuth from "./pages/GroomerAuth";
import GroomerOnboarding from "./pages/GroomerOnboarding";
import GroomerDashboard from "./pages/GroomerDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CancellationPolicy from "./pages/CancellationPolicy";
import EditEvent from "./pages/EditEvent";
import PetGrooming from "./pages/pet-grooming";
import GroomerDetail from "./pages/pet-grooming/GroomerDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vet-onboarding" element={<VetOnboarding />} />
          <Route path="/vet-auth" element={<VetAuth />} />
          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/find-vets" element={<FindVets />} />
          <Route path="/consultation/:id" element={<ConsultationChat />} />
          <Route path="/groomer-auth" element={<GroomerAuth />} />
          <Route path="/groomer-onboarding" element={<GroomerOnboarding />} />
          <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/pet-grooming" element={<PetGrooming />} />
          <Route path="/groomer/:id" element={<GroomerDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
