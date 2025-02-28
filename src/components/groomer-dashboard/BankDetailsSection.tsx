
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, AlertCircle } from "lucide-react";

interface BankDetailsSectionProps {
  groomerId: string;
  onBankDetailsUpdated: () => void;
}

export function BankDetailsSection({ groomerId, onBankDetailsUpdated }: BankDetailsSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_name: '',
    account_number: '',
    ifsc_code: ''
  });
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  useEffect(() => {
    fetchBankDetails();
  }, [groomerId]);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groomer_bank_details')
        .select('*')
        .eq('groomer_id', groomerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching bank details:", error);
        throw error;
      }

      if (data) {
        setBankDetails({
          account_name: data.account_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || ''
        });
        setConfirmAccountNumber(data.account_number || '');
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Could not load bank details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateIFSC = (code: string): boolean => {
    // IFSC code format: 4 characters (bank code) + 0 + 6 characters (branch code)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  const handleSaveBankDetails = async () => {
    try {
      if (!bankDetails.account_name || !bankDetails.account_number || !bankDetails.ifsc_code) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (bankDetails.account_number !== confirmAccountNumber) {
        toast({
          title: "Account numbers don't match",
          description: "Please verify the account number",
          variant: "destructive",
        });
        return;
      }

      if (!validateIFSC(bankDetails.ifsc_code)) {
        toast({
          title: "Invalid IFSC code",
          description: "Please enter a valid IFSC code (e.g., SBIN0123456)",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('groomer_bank_details')
        .upsert({
          groomer_id: groomerId,
          account_name: bankDetails.account_name,
          account_number: bankDetails.account_number,
          ifsc_code: bankDetails.ifsc_code
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });

      setEditing(false);
      onBankDetailsUpdated();
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: "Failed to save bank details",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Details</CardTitle>
        {!editing ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setEditing(false);
              fetchBankDetails(); // Reset form
            }}
          >
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!editing ? (
          bankDetails.account_name ? (
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Account Holder:</span>
                <p className="font-medium">{bankDetails.account_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Account Number:</span>
                <p className="font-medium">
                  {bankDetails.account_number.replace(/\d(?=\d{4})/g, "•")}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">IFSC Code:</span>
                <p className="font-medium">{bankDetails.ifsc_code}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No bank details added yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditing(true)}
              >
                Add Bank Details
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Holder Name</Label>
              <Input
                id="account_name"
                value={bankDetails.account_name}
                onChange={(e) => setBankDetails({...bankDetails, account_name: e.target.value})}
                placeholder="Enter name as on passbook"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value.replace(/\D/g, '')})}
                placeholder="Enter account number"
                type="text"
                inputMode="numeric"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_account_number">Verify Account Number</Label>
              <Input
                id="confirm_account_number"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter account number"
                type="text"
                inputMode="numeric"
              />
              {bankDetails.account_number && confirmAccountNumber && 
               bankDetails.account_number !== confirmAccountNumber && (
                <p className="text-xs text-red-500 mt-1">Account numbers don't match</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input
                id="ifsc_code"
                value={bankDetails.ifsc_code}
                onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value.toUpperCase()})}
                placeholder="e.g., SBIN0123456"
                maxLength={11}
              />
              <p className="text-xs text-gray-500">
                4 chars (bank) + 0 + 6 chars (branch)
              </p>
            </div>
            
            <Button 
              onClick={handleSaveBankDetails} 
              className="w-full mt-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Bank Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
