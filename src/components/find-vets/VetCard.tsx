
import { Star } from "lucide-react";

interface VetProfile {
  id: string;
  clinic_name: string;
  specializations: string[];
  years_of_experience: number;
  bio: string | null;
}

interface VetCardProps {
  vet: VetProfile;
}

export function VetCard({ vet }: VetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{vet.clinic_name}</h2>
          <p className="text-sm text-gray-500">
            {vet.years_of_experience} years of experience
          </p>
        </div>
        <div className="flex items-center text-yellow-500">
          <Star className="h-5 w-5 fill-current" />
          <span className="ml-1 text-sm">Available</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {vet.specializations?.map((spec, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {vet.bio && (
        <p className="text-sm text-gray-600 line-clamp-3">{vet.bio}</p>
      )}
    </div>
  );
}
