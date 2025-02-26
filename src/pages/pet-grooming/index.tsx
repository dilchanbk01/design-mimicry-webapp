
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { GroomingHeader } from "./components/GroomingHeader";
import { GroomerCard } from "./components/GroomerCard";
import { BookingDialog } from "./components/BookingDialog";
import { GroomingHeroBanner } from "./components/GroomingHeroBanner";
import { GROOMING_PARTNERS } from "./data/partners";
import type { GroomingPartner } from "./types";
import { useInterval } from "@/hooks/use-interval";

export default function PetGrooming() {
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<GroomingPartner | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useInterval(() => {
    const heroBanners = document.querySelectorAll('[data-hero-banner]');
    if (heroBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
  }, 3000); // Auto-slide every 3 seconds

  const handleBooking = (partner: GroomingPartner) => {
    setSelectedPartner(partner);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Confirmed!",
      description: `Your grooming appointment has been booked with ${selectedPartner?.name}`,
    });
    setIsBookingOpen(false);
    setBookingDate("");
    setBookingTime("");
    setPetDetails("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GroomingHeroBanner 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
      />
      <GroomingHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {GROOMING_PARTNERS.map((partner) => (
            <GroomerCard
              key={partner.id}
              partner={partner}
              onBooking={handleBooking}
            />
          ))}
        </div>
      </main>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        selectedPartner={selectedPartner}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        petDetails={petDetails}
        onDateChange={setBookingDate}
        onTimeChange={setBookingTime}
        onPetDetailsChange={setPetDetails}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}
