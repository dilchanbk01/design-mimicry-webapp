
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
    // Check authentication
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

    // Initialize Google Places Autocomplete
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY&libraries=places";
    script.async = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [navigate, toast]);

  const initAutocomplete = () => {
    const input = document.getElementById("location-input") as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setFormData(prev => ({
        ...prev,
        location: place.formatted_address || "",
      }));
    });
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
          organizer_website: formData.instagram ? `https://instagram.com/${formData.instagram}` : "",
          pet_types: formData.selectedPets,
          organizer_id: user.id,
          status: 'pending'
        },
      ]);

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
          {/* Image Upload Section */}
          <div className="relative h-[200px] bg-gray-100">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50"
                >
                  Upload Image
                </Label>
              </div>
            )}
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Event Title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-semibold"
              />

              <select
                className="w-full rounded-md border border-input bg-background px-3 h-10"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Input
                id="location-input"
                placeholder="Start typing to search..."
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>

            <Textarea
              placeholder="Event Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />

            {/* Ticket and Price Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Maximum Attendees</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ticket Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Organizer Section */}
            <div className="space-y-4">
              <Input
                placeholder="Organizer Name"
                required
                value={formData.organizerName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerName: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="Organizer Email"
                required
                value={formData.organizerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerEmail: e.target.value }))}
              />
              <Input
                placeholder="Organizer Phone"
                value={formData.organizerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerPhone: e.target.value }))}
              />
              <div className="relative">
                <Input
                  placeholder="Instagram Handle (optional)"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="pl-10"
                />
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Pet Types Section */}
            <div className="space-y-4">
              <Label>Pet Types Welcome</Label>
              <div className="grid grid-cols-2 gap-4">
                {petTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={formData.selectedPets.includes(type.id)}
                      onCheckedChange={() => handlePetTypeChange(type.id)}
                    />
                    <Label htmlFor={type.id}>{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

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
