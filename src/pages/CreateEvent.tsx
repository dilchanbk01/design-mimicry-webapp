
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadSection } from "@/components/create-event/ImageUploadSection";
import { EventBasicInfo } from "@/components/create-event/EventBasicInfo";
import { DateTimeSection } from "@/components/create-event/DateTimeSection";
import { LocationInput } from "@/components/create-event/LocationInput";
import { OrganizerInfo } from "@/components/create-event/OrganizerInfo";
import { PetTypeSelection } from "@/components/create-event/PetTypeSelection";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMjSsICfQQn0ubanKa1kxr9S9Exo4xRrQ";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const autocompleteInitialized = useRef(false);
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
    instagram: "",
    selectedPets: [] as string[],
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

  const petTypes = [
    { id: "dogs", label: "Dogs" },
    { id: "cats", label: "Cats" },
    { id: "birds", label: "Birds" },
    { id: "small_pets", label: "Small Pets" },
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

    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement("script");
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initAutocomplete();
      };
      document.head.appendChild(script);
    } else if (window.google && !autocompleteInitialized.current) {
      initAutocomplete();
    }

    return () => {
      autocompleteInitialized.current = false;
    };
  }, [navigate, toast]);

  const initAutocomplete = () => {
    if (!window.google) return;
    
    const input = document.getElementById("location-input") as HTMLInputElement;
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        fields: ['formatted_address', 'geometry'],
        componentRestrictions: { country: 'in' } // Restrict to India
      });

      // Add input event listener to control when autocomplete starts
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value.length < 4) {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            (pacContainer as HTMLElement).style.display = 'none';
          }
        } else {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            (pacContainer as HTMLElement).style.display = 'block';
          }
        }
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setFormData(prev => ({
            ...prev,
            location: place.formatted_address,
          }));
        }
      });
      
      autocompleteInitialized.current = true;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePetTypeChange = (petId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPets: prev.selectedPets.includes(petId)
        ? prev.selectedPets.filter(id => id !== petId)
        : [...prev.selectedPets, petId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

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

      const { error } = await supabase.from("events").insert({
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
        organizer_website: formData.instagram ? `https://instagram.com/${formData.instagram}` : "",
        pet_types: formData.selectedPets.join(","),
        organizer_id: user.id,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event submitted for approval. You can track its status in your profile.",
      });

      navigate("/profile");
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
          variant="ghost"
          size="icon"
          className="mb-6 bg-white rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ImageUploadSection
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <EventBasicInfo
              title={formData.title}
              type={formData.type}
              onTitleChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              onTypeChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              eventTypes={eventTypes}
            />

            <DateTimeSection
              date={formData.date}
              time={formData.time}
              onDateChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              onTimeChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            />

            <LocationInput
              location={formData.location}
              onLocationChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />

            <Textarea
              placeholder="Event Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Maximum Attendees</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                />
              </div>
              <div>
                <label>Ticket Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                />
              </div>
            </div>

            <OrganizerInfo
              name={formData.organizerName}
              email={formData.organizerEmail}
              phone={formData.organizerPhone}
              instagram={formData.instagram}
              onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />

            <PetTypeSelection
              selectedPets={formData.selectedPets}
              petTypes={petTypes}
              onPetTypeChange={handlePetTypeChange}
            />

            <Button
              type="submit"
              className="w-full bg-[#00D26A] hover:bg-[#00D26A]/90 text-white"
              disabled={loading}
            >
              {loading ? "Submitting Event..." : "Submit My Event"}
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        .pac-container {
          z-index: 9999 !important;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-top: 4px;
          font-family: inherit;
          display: none;
        }
        .pac-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
        }
        .pac-item:hover {
          background-color: #f3f4f6;
        }
        .pac-item-query {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
