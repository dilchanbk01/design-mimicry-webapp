
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Award, MapPin, Phone, Mail, Scissors } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookingDialog } from "./components/BookingDialog";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { GroomerType } from "./types";

export default function GroomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [groomer, setGroomer] = useState<GroomerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [packages, setPackages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("about");

  useEffect(() => {
    if (id) {
      fetchGroomerData(id);
      fetchGroomerPackages(id);
      fetchGroomerReviews(id);
    }
  }, [id]);

  const fetchGroomerData = async (groomerId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("groomer_profiles")
        .select("*")
        .eq("id", groomerId)
        .single();

      if (error) throw error;
      
      setGroomer(data);
    } catch (error) {
      console.error("Error fetching groomer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroomerPackages = async (groomerId: string) => {
    try {
      const { data, error } = await supabase
        .from("grooming_packages")
        .select("*")
        .eq("groomer_id", groomerId)
        .order("price", { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching groomer packages:", error);
    }
  };

  const fetchGroomerReviews = async (groomerId: string) => {
    try {
      // In a real app, this would fetch from a reviews table
      // For now, using mock data
      setReviews([
        {
          id: 1,
          user_name: "John D.",
          rating: 5,
          comment:
            "Absolutely amazing service! My dog looks fantastic and was treated with such care.",
          date: "2023-05-15",
        },
        {
          id: 2,
          user_name: "Sarah M.",
          rating: 4,
          comment:
            "Great grooming service, very professional. My cat was a bit stressed but they handled him well.",
          date: "2023-04-22",
        },
        {
          id: 3,
          user_name: "David R.",
          rating: 5,
          comment:
            "Best grooming service in the area. My poodle always comes back looking gorgeous!",
          date: "2023-03-10",
        },
      ]);
    } catch (error) {
      console.error("Error fetching groomer reviews:", error);
    }
  };

  const handleBookNow = (service: string) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!groomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Groomer Not Found</h2>
          <p className="text-gray-600">
            The groomer you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TransparentHeader />

      {/* Header/Cover Image */}
      <div className="h-64 bg-gradient-to-r from-primary to-blue-500 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white">
          <h1 className="text-2xl font-bold">{groomer.salon_name}</h1>
          <div className="flex items-center mt-1">
            <div className="flex mr-2">{renderStars(4)}</div>
            <span>{calculateAverageRating()} · {reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 -mt-6 relative z-10">
        <div className="bg-white rounded-t-xl shadow-sm">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                selectedTab === "about"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setSelectedTab("about")}
            >
              About
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                selectedTab === "services"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setSelectedTab("services")}
            >
              Services
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                selectedTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setSelectedTab("reviews")}
            >
              Reviews
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {selectedTab === "about" && (
              <div className="space-y-4">
                {/* About Section */}
                <div>
                  <h2 className="text-lg font-medium mb-2">About {groomer.salon_name}</h2>
                  <p className="text-gray-600">{groomer.description}</p>
                </div>

                {/* Location & Contact */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-gray-600">{groomer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600">{groomer.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">{groomer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-4">
                  <h3 className="font-medium flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    Business Hours
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span>9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4">
                  <h3 className="font-medium flex items-center">
                    <Scissors className="h-5 w-5 text-primary mr-2" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {groomer.specializations?.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="mt-4">
                  <h3 className="font-medium flex items-center">
                    <Award className="h-5 w-5 text-primary mr-2" />
                    Experience
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {groomer.experience ? `${groomer.experience} years of experience in pet grooming` : "Professional pet grooming services"}
                  </p>
                </div>
              </div>
            )}

            {selectedTab === "services" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Our Services</h2>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="border rounded-lg p-4 transition-all hover:border-primary"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{pkg.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                          
                          <div className="mt-2 space-y-1">
                            {pkg.features && pkg.features.map((feature: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-sm text-gray-600">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">₹{pkg.price}</div>
                          <div className="text-xs text-gray-500">{pkg.duration || '60'} mins</div>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-3"
                        onClick={() => handleBookNow(pkg.name)}
                      >
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "reviews" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Customer Reviews</h2>
                  <div className="flex items-center">
                    <div className="flex mr-1">{renderStars(4)}</div>
                    <span className="text-sm">{calculateAverageRating()}/5</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {review.user_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.user_name}</span>
                        </div>
                        <div className="flex text-yellow-400">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        groomer={groomer}
        selectedService={selectedService}
        packages={packages}
      />
    </div>
  );
}
