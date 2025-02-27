
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
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPartner: GroomingPartner | null;
  bookingDate: string;
  bookingTime: string;
  petDetails: string;
  homeAddress: string;
  isHomeService: boolean;
  priceDetails: {
    basePrice: number;
    gstAmount: number;
    totalAmount: number;
  };
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onPetDetailsChange: (details: string) => void;
  onHomeAddressChange: (address: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  selectedPartner,
  bookingDate,
  bookingTime,
  petDetails,
  homeAddress,
  isHomeService,
  priceDetails,
  onDateChange,
  onTimeChange,
  onPetDetailsChange,
  onHomeAddressChange,
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
          {selectedPartner && (
            <div className="p-3 bg-gray-50 rounded-md mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Selected Package</p>
                <div className="flex items-center">
                  <p className="text-[#9b87f5] font-semibold">{selectedPartner.price}</p>
                  <Popover>
                    <PopoverTrigger>
                      <Info className="h-4 w-4 text-gray-400 ml-1 cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-60 bg-white">
                      <div className="space-y-2">
                        <h4 className="font-medium">Price Breakdown</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span>₹{priceDetails.basePrice.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST (18%):</span>
                            <span>₹{priceDetails.gstAmount.toFixed(0)}</span>
                          </div>
                          <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                            <span>Total:</span>
                            <span>₹{priceDetails.totalAmount.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
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

          {isHomeService && (
            <div className="space-y-2">
              <Label htmlFor="homeAddress">Your Address</Label>
              <Textarea
                id="homeAddress"
                placeholder="Enter your complete address for the home service"
                value={homeAddress}
                onChange={(e) => onHomeAddressChange(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
            Confirm Booking (₹{priceDetails.totalAmount.toFixed(0)})
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
