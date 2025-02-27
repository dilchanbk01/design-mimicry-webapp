
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { GroomingPackage } from "../types/packages";

interface DialogGroomer {
  id: string;
  name: string;
  address: string;
  experienceYears: number;
  specializations: string[];
  price: number;
  profileImageUrl: string | null;
  providesHomeService: boolean;
  providesSalonService: boolean;
  homeServiceCost: number;
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groomer: DialogGroomer;
  packages: GroomingPackage[];
  selectedDate: Date;
  selectedTime: string;
  selectedPackage: GroomingPackage | null;
  selectedServiceType: 'salon' | 'home';
  petDetails: string;
  homeAddress: string;
  isBookingConfirmed: boolean;
  totalPrice: number;
  isProcessing: boolean;
  
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onPackageChange: (pkg: GroomingPackage | null) => void;
  onServiceTypeChange: (type: 'salon' | 'home') => void;
  onPetDetailsChange: (details: string) => void;
  onHomeAddressChange: (address: string) => void;
  onConfirm: () => void;
}

export function BookingDialog({ 
  isOpen,
  onClose,
  groomer,
  packages,
  selectedDate,
  selectedTime,
  selectedPackage,
  selectedServiceType,
  petDetails,
  homeAddress,
  isBookingConfirmed,
  totalPrice,
  isProcessing,
  
  onDateChange,
  onTimeChange,
  onPackageChange,
  onServiceTypeChange,
  onPetDetailsChange,
  onHomeAddressChange,
  onConfirm
}: BookingDialogProps) {
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Handle date input change and convert string to Date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    const newDate = new Date(dateString);
    onDateChange(newDate);
  };

  // Handle address fields changes
  useEffect(() => {
    updateAddress();
  }, [streetAddress, city, phoneNumber]);

  const updateAddress = () => {
    const fullAddress = [
      streetAddress,
      city,
      phoneNumber
    ].filter(Boolean).join(", ");
    
    onHomeAddressChange(fullAddress);
  };

  // Reset address form fields when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStreetAddress('');
      setCity('');
      setPhoneNumber('');
    }
  }, [isOpen]);

  // Parse existing address when opening dialog
  useEffect(() => {
    if (isOpen && homeAddress) {
      const parts = homeAddress.split(', ');
      if (parts.length >= 1) setStreetAddress(parts[0]);
      if (parts.length >= 2) setCity(parts[1]);
      if (parts.length >= 3) setPhoneNumber(parts[2]);
    }
  }, [isOpen, homeAddress]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pt-2">
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule your grooming appointment with {groomer.name}
          </DialogDescription>
        </DialogHeader>
        
        {isBookingConfirmed ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your appointment has been scheduled with {groomer.name} for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formattedDate}
                  onChange={handleDateChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  disabled={isProcessing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => onTimeChange(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Service Type</Label>
              <RadioGroup value={selectedServiceType} onValueChange={(value: 'salon' | 'home') => onServiceTypeChange(value)}>
                {groomer.providesSalonService && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="salon" id="salon" disabled={isProcessing} />
                    <Label htmlFor="salon" className="cursor-pointer">Salon Visit</Label>
                  </div>
                )}
                {groomer.providesHomeService && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" disabled={isProcessing} />
                    <Label htmlFor="home" className="cursor-pointer">
                      Home Visit
                      {groomer.homeServiceCost > 0 && (
                        <span className="text-xs text-green-600 ml-2">(+₹{groomer.homeServiceCost})</span>
                      )}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            
            {selectedServiceType === 'home' && (
              <div className="space-y-3">
                <Label>Your Address</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="streetAddress" className="text-xs text-gray-500">Street Address</Label>
                    <Input
                      id="streetAddress"
                      placeholder="House/Flat No., Building Name, Street"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs text-gray-500">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-xs text-gray-500">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Phone Number for contact"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="package">Select Package</Label>
              <RadioGroup 
                value={selectedPackage ? selectedPackage.id : "standard"} 
                onValueChange={(value) => {
                  const pkg = packages.find(p => p.id === value);
                  onPackageChange(pkg || null);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" disabled={isProcessing} />
                  <Label htmlFor="standard" className="cursor-pointer">
                    Standard Grooming (₹{groomer.price})
                  </Label>
                </div>
                
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={pkg.id} id={pkg.id} disabled={isProcessing} />
                    <Label htmlFor={pkg.id} className="cursor-pointer">
                      {pkg.name} (₹{pkg.price})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="petDetails">Pet Details</Label>
              <Textarea
                id="petDetails"
                placeholder="Tell us about your pet (breed, age, specific needs)"
                value={petDetails}
                onChange={(e) => onPetDetailsChange(e.target.value)}
                disabled={isProcessing}
                required
                className="resize-none"
                rows={3}
              />
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Price:</span>
              <span className="text-lg font-bold text-green-600">₹{totalPrice}</span>
            </div>
            
            <Button 
              type="button" 
              className="w-full" 
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Booking"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
