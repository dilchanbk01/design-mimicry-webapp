
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

  // Check authentication on component mount
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // First upload the image
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

      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      // Create event
      const { error } = await supabase.from("events").insert([
        {
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location,
          price: formData.price,
          capacity: formData.capacity,
          image_url: imageUrl || 'https://placehold.co/600x400?text=No+Image',
          duration: 120, // Default duration in minutes
          event_type: formData.type,
          organizer_name: formData.organizerName,
          organizer_email: formData.organizerEmail,
          organizer_phone: formData.organizerPhone,
          organizer_website: formData.organizerWebsite,
          pet_types: formData.petTypes,
          pet_requirements: formData.petRequirements,
          organizer_id: user.id, // Set the organizer_id to the current user's ID
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
            {/* Event Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Event Details</h2>
              <Input
                required
                placeholder="Event Name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder="Event Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.files ? e.target.files[0] : null,
                  })
                }
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Location</h2>
              <Input
                placeholder="Event Location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            {/* Ticketing & Pricing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Ticketing & Pricing
              </h2>
              <Input
                type="number"
                placeholder="Ticket Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="Maximum Attendees"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
              />
            </div>

            {/* Organizer Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Organizer Details
              </h2>
              <Input
                placeholder="Organizer Name"
                required
                value={formData.organizerName}
                onChange={(e) =>
                  setFormData({ ...formData, organizerName: e.target.value })
                }
              />
              <Input
                type="email"
                placeholder="Organizer Email"
                required
                value={formData.organizerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, organizerEmail: e.target.value })
                }
              />
              <Input
                placeholder="Organizer Phone"
                value={formData.organizerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, organizerPhone: e.target.value })
                }
              />
              <Input
                placeholder="Website/Social Media"
                value={formData.organizerWebsite}
                onChange={(e) =>
                  setFormData({ ...formData, organizerWebsite: e.target.value })
                }
              />
            </div>

            {/* Pet-Friendly Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Pet-Friendly Information
              </h2>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.petTypes}
                onChange={(e) =>
                  setFormData({ ...formData, petTypes: e.target.value })
                }
              >
                {petTypeOptions.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder="Special Pet Requirements (e.g., Vaccination proof, Leash required)"
                value={formData.petRequirements}
                onChange={(e) =>
                  setFormData({ ...formData, petRequirements: e.target.value })
                }
              />
            </div>

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
