
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
import { GroomingPartner } from "../types";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPartner: GroomingPartner | null;
  bookingDate: string;
  bookingTime: string;
  petDetails: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onPetDetailsChange: (details: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  selectedPartner,
  bookingDate,
  bookingTime,
  petDetails,
  onDateChange,
  onTimeChange,
  onPetDetailsChange,
  onSubmit,
}: BookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Grooming Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with {selectedPartner?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={bookingDate}
              onChange={(e) => onDateChange(e.target.value)}
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
              onChange={(e) => onTimeChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="petDetails">Pet Details</Label>
            <Textarea
              id="petDetails"
              placeholder="Tell us about your pet (breed, age, special requirements)"
              value={petDetails}
              onChange={(e) => onPetDetailsChange(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Confirm Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
