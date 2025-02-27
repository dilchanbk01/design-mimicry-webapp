
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PriceDetails {
  basePrice: number;
  gstAmount: number;
  totalAmount: number;
}

interface PriceDisplayProps {
  basePrice: number;
  homeServiceCost?: number;
  serviceType: 'salon' | 'home';
  priceDetails?: PriceDetails;
}

export function PriceDisplay({ 
  basePrice, 
  homeServiceCost = 0, 
  serviceType,
  priceDetails 
}: PriceDisplayProps) {
  // Calculate GST (18%)
  const gstRate = 0.18;
  const additionalCost = serviceType === 'home' ? homeServiceCost : 0;
  const subtotal = basePrice + additionalCost;
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;
  
  // Use the provided price details or calculate them
  const details = priceDetails || {
    basePrice: subtotal,
    gstAmount,
    totalAmount
  };

  return (
    <div className="flex items-center mb-2">
      <p className="font-semibold text-lg text-green-600 mr-2">
        ₹{details.totalAmount.toFixed(0)}
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-gray-400 hover:text-green-600">
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-60 bg-white z-50">
          <div className="space-y-2">
            <h4 className="font-medium">Price Breakdown</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>₹{basePrice.toFixed(0)}</span>
              </div>
              {additionalCost > 0 && (
                <div className="flex justify-between">
                  <span>Home Service:</span>
                  <span>₹{additionalCost.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{details.gstAmount.toFixed(0)}</span>
              </div>
              <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                <span>Total:</span>
                <span>₹{details.totalAmount.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
