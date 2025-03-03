
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";
import { GroomerProfile } from "@/pages/pet-grooming/types";

interface GroomersListProps {
  searchQuery: string;
}

export function GroomersList({ searchQuery }: GroomersListProps) {
  const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroomers();
  }, []);

  const fetchGroomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groomer_profiles')
        .select('*');

      if (error) throw error;
      
      console.log("Fetched groomer data:", data);
      setGroomers(data || []);
    } catch (error) {
      console.error('Error fetching groomers:', error);
      toast({
        title: "Error",
        description: "Failed to load groomer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGroomerStatus = async (groomerId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('groomer_profiles')
        .update({ application_status: status })
        .eq('id', groomerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Groomer ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh the list
      fetchGroomers();
    } catch (error) {
      console.error('Error updating groomer status:', error);
      toast({
        title: "Error",
        description: "Failed to update groomer status",
        variant: "destructive",
      });
    }
  };

  const filteredGroomers = groomers.filter(groomer => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      groomer.salon_name?.toLowerCase().includes(query) ||
      groomer.address?.toLowerCase().includes(query) ||
      groomer.contact_number?.toLowerCase().includes(query) ||
      groomer.application_status?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div className="text-center py-4">Loading groomer data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Groomer Applications</h2>
        <span className="text-sm text-gray-500">{filteredGroomers.length} groomers</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Groomer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGroomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No groomers found
              </TableCell>
            </TableRow>
          ) : (
            filteredGroomers.map((groomer) => (
              <TableRow key={groomer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <img 
                        src={groomer.profile_image_url || '/placeholder-avatar.png'} 
                        alt={groomer.salon_name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-avatar.png';
                        }}
                      />
                    </Avatar>
                    <div>
                      <div className="font-medium">{groomer.salon_name}</div>
                      <div className="text-sm text-gray-500">{groomer.address}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{groomer.contact_number}</TableCell>
                <TableCell>{groomer.experience_years} years</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      groomer.application_status === 'approved' ? 'default' : 
                      groomer.application_status === 'rejected' ? 'destructive' : 
                      'outline'
                    }
                  >
                    {groomer.application_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {groomer.application_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateGroomerStatus(groomer.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateGroomerStatus(groomer.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {groomer.application_status !== 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // View details or reset status
                        console.log("View groomer details", groomer);
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
