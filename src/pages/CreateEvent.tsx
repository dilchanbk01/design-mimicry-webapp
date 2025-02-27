
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    isFreeEvent: false,
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
  }, [navigate, toast]);

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
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate("/events")}
            variant="ghost"
            size="icon"
            className="bg-white rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <img 
            src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
            alt="Petsu"
            className="h-12 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Free Event</label>
                    <Switch
                      checked={formData.isFreeEvent}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          isFreeEvent: checked,
                          price: checked ? 0 : prev.price
                        }));
                      }}
                    />
                  </div>
                  
                  {!formData.isFreeEvent && (
                    <div>
                      <label>Ticket Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        className="mt-1 w-full rounded-md border border-input px-3 py-2"
                        disabled={formData.isFreeEvent}
                      />
                    </div>
                  )}
                </div>
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
    </div>
  );
}
