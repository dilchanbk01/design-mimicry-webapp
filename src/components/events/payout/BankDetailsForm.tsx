
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankDetailsFormProps {
  onBankDetailsChange: (details: BankDetails) => void;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
}

export function BankDetailsForm({ onBankDetailsChange }: BankDetailsFormProps) {
  const [details, setDetails] = useState<BankDetails>({
    accountName: "",
    accountNumber: "",
    ifscCode: ""
  });

  const handleChange = (field: keyof BankDetails, value: string) => {
    const updatedDetails = { ...details, [field]: value };
    setDetails(updatedDetails);
    onBankDetailsChange(updatedDetails);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="accountName">Account Holder Name</Label>
        <Input
          id="accountName"
          placeholder="Full name as per bank records"
          value={details.accountName}
          onChange={(e) => handleChange("accountName", e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          placeholder="Your bank account number"
          value={details.accountNumber}
          onChange={(e) => handleChange("accountNumber", e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input
          id="ifscCode"
          placeholder="Bank IFSC code"
          value={details.ifscCode}
          onChange={(e) => handleChange("ifscCode", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}
