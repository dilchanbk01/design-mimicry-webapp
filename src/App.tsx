
import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";

// Default Pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Events = lazy(() => import("./pages/Events"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const VetAuth = lazy(() => import("./pages/VetAuth"));
const VetOnboarding = lazy(() => import("./pages/VetOnboarding"));
const FindVets = lazy(() => import("./pages/FindVets"));
const VetDashboard = lazy(() => import("./pages/VetDashboard"));
const ConsultationChat = lazy(() => import("./pages/ConsultationChat"));
const GroomerAuth = lazy(() => import("./pages/GroomerAuth"));
const GroomerOnboarding = lazy(() => import("./pages/GroomerOnboarding"));
const GroomerPending = lazy(() => import("./pages/GroomerPending"));
const GroomerDashboard = lazy(() => import("./pages/GroomerDashboard"));

// Pet Grooming Pages
const PetGrooming = lazy(() => import("./pages/pet-grooming"));
const GroomerDetail = lazy(() => import("./pages/pet-grooming/GroomerDetail"));
const GroomerBookingConfirmation = lazy(() => import("./pages/pet-grooming/GroomerBookingConfirmation"));

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect simulates initialization tasks
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-medium text-green-600">
          Loading Petsu...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="animate-pulse text-xl font-medium text-green-600">
              Loading...
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/vet/login" element={<VetAuth />} />
          <Route path="/vet/onboarding" element={<VetOnboarding />} />
          <Route path="/vet/dashboard" element={<VetDashboard />} />
          <Route path="/find-vets" element={<FindVets />} />
          <Route path="/consultation/:id" element={<ConsultationChat />} />
          <Route path="/groomer/login" element={<GroomerAuth />} />
          <Route path="/groomer/onboarding" element={<GroomerOnboarding />} />
          <Route path="/groomer/pending" element={<GroomerPending />} />
          <Route path="/groomer/dashboard" element={<GroomerDashboard />} />
          
          {/* Pet Grooming routes */}
          <Route path="/pet-grooming" element={<PetGrooming />} />
          <Route path="/pet-grooming/groomer/:id" element={<GroomerDetail />} />
          <Route path="/pet-grooming/booking/:id" element={<GroomerBookingConfirmation />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
