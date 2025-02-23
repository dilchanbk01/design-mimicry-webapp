
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsSection } from "@/components/event-form/EventDetailsSection";
import { DateTimeSection } from "@/components/event-form/DateTimeSection";
import { LocationSection } from "@/components/event-form/LocationSection";
import { TicketingSection } from "@/components/event-form/TicketingSection";
import { OrganizerSection } from "@/components/event-form/OrganizerSection";
import { PetSection } from "@/components/event-form/PetSection";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "meetup",
    description: "",
    date: "",
    time: "",
    location: "",
    price: 0,
    capacity: 0,
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    organizerWebsite: "",
    petTypes: "all",
    petRequirements: "",
    image: null as File | null,
  });

  const eventTypes = [
    "Meetup",
    "Adoption Drive",
    "Training Workshop",
    "Pet Show",
    "Fundraiser",
    "Health Clinic",
    "Grooming Session",
  ];

  const petTypeOptions = [
    "All Pets",
    "Dogs Only",
    "Cats Only",
    "Birds Only",
    "Small Pets",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create an event.",
          variant: "destructive",
        });
        navigate("/events");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      let imageUrl = "";
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("events")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      const { error } = await supabase.from("events").insert([
        {
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location,
          price: formData.price,
          capacity: formData.capacity,
          image_url: imageUrl || 'https://placehold.co/600x400?text=No+Image',
          duration: 120,
          event_type: formData.type,
          organizer_name: formData.organizerName,
          organizer_email: formData.organizerEmail,
          organizer_phone: formData.organizerPhone,
          organizer_website: formData.organizerWebsite,
          pet_types: formData.petTypes,
          pet_requirements: formData.petRequirements,
          organizer_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event created successfully.",
      });

      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00D26A] py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          onClick={() => navigate("/events")}
          variant="outline"
          className="mb-6 bg-white"
        >
          Back to Events
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Event</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <EventDetailsSection
              title={formData.title}
              type={formData.type}
              description={formData.description}
              image={formData.image}
              eventTypes={eventTypes}
              onChange={handleChange}
            />

            <DateTimeSection
              date={formData.date}
              time={formData.time}
              onChange={handleChange}
            />

            <LocationSection
              location={formData.location}
              onChange={handleChange}
            />

            <TicketingSection
              price={formData.price}
              capacity={formData.capacity}
              onChange={handleChange}
            />

            <OrganizerSection
              organizerName={formData.organizerName}
              organizerEmail={formData.organizerEmail}
              organizerPhone={formData.organizerPhone}
              organizerWebsite={formData.organizerWebsite}
              onChange={handleChange}
            />

            <PetSection
              petTypes={formData.petTypes}
              petRequirements={formData.petRequirements}
              petTypeOptions={petTypeOptions}
              onChange={handleChange}
            />

            <Button
              type="submit"
              className="w-full bg-[#00D26A] hover:bg-[#00D26A]/90 text-white"
              disabled={loading}
            >
              {loading ? "Creating Event..." : "Create Event"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
