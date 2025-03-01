
import { useState, useEffect } from "react";
import { Groomer } from "./types";

interface UseGroomerFiltersReturn {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  filteredGroomers: Groomer[];
  filterGroomers: (query: string, groomers: Groomer[]) => void;
  applyStatusFilter: (filter: string, groomers: Groomer[], searchQuery: string) => void;
}

export function useGroomerFilters(initialGroomers: Groomer[] = []): UseGroomerFiltersReturn {
  const [filteredGroomers, setFilteredGroomers] = useState<Groomer[]>(initialGroomers);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    setFilteredGroomers(initialGroomers);
  }, [initialGroomers]);

  const filterGroomers = (query: string, groomers: Groomer[]) => {
    const filtered = groomers.filter(groomer => 
      groomer.salon_name.toLowerCase().includes(query.toLowerCase()) ||
      groomer.address.toLowerCase().includes(query.toLowerCase()) ||
      groomer.contact_number.toLowerCase().includes(query.toLowerCase()) ||
      groomer.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGroomers(filtered);
  };

  const applyStatusFilter = (filter: string, groomers: Groomer[], searchQuery: string) => {
    console.log("Applying filter:", filter);
    console.log("Available groomers:", groomers);

    let filtered;
    if (filter === "all") {
      filtered = groomers;
    } else {
      filtered = groomers.filter(g => g.application_status === filter);
    }

    console.log("Filtered groomers:", filtered);

    // Apply search filter if there's a query
    if (searchQuery) {
      filtered = filtered.filter(groomer => 
        groomer.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.contact_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groomer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredGroomers(filtered);
  };

  return {
    activeFilter,
    setActiveFilter,
    filteredGroomers,
    filterGroomers,
    applyStatusFilter
  };
}
