
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Star, ArrowLeft, Scissors, Calendar } from "lucide-react";

interface GroomingPartner {
  id: string;
  name: string;
  rating: number;
  location: string;
  experience: string;
  price: string;
  image: string;
}

const GROOMING_PARTNERS: GroomingPartner[] = [
  {
    id: "1",
    name: "Pawsome Grooming",
    rating: 4.8,
    location: "Koramangala, Bangalore",
    experience: "8+ years experience",
    price: "Starting from ₹999",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Pet Style Studio",
    rating: 4.6,
    location: "HSR Layout, Bangalore",
    experience: "5+ years experience",
    price: "Starting from ₹899",
    image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Furry Friends Salon",
    rating: 4.9,
    location: "Indiranagar, Bangalore",
    experience: "10+ years experience",
    price: "Starting from ₹1299",
    image: "https://images.unsplash.com/photo-1628557010314-39c53ad9c8da?w=800&auto=format&fit=crop&q=60",
  },
];

export default function PetGrooming() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<GroomingPartner | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [petDetails, setPetDetails] = useState("");

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Pet Grooming</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {GROOMING_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{partner.name}</h2>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{partner.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{partner.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center text-gray-600">
                        <Scissors className="h-4 w-4 mr-1" />
                        <span className="text-sm">{partner.experience}</span>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {partner.price}
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full md:w-auto"
                    onClick={() => handleBooking(partner)}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Grooming Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment with {selectedPartner?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="petDetails">Pet Details</Label>
              <Textarea
                id="petDetails"
                placeholder="Tell us about your pet (breed, age, special requirements)"
                value={petDetails}
                onChange={(e) => setPetDetails(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Confirm Booking
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
