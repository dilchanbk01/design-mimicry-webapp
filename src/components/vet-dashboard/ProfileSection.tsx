
import { Card } from "@/components/ui/card";
import type { VetProfile } from "@/types/vet";
import { Badge } from "@/components/ui/badge";

interface ProfileSectionProps {
  profile: VetProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, Dr. {profile.clinic_name}</h1>
          <p className="text-gray-500">{profile.contact_number} • {profile.address}</p>
        </div>
        <Badge 
          variant={profile.application_status === 'approved' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {profile.application_status || 'Pending'}
        </Badge>
      </div>

      {profile.application_status === 'pending' && (
        <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-md mb-4">
          <p className="text-sm">
            Your application is currently under review. We'll notify you once it's approved.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations?.map((spec) => (
              <Badge key={spec} variant="outline">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Experience & License</h3>
          <p className="text-sm text-gray-600">
            {profile.years_of_experience} years of experience
          </p>
          <p className="text-sm text-gray-600">
            License: {profile.license_number}
          </p>
        </div>
      </div>

      {profile.bio && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">About</h3>
          <p className="text-sm text-gray-600">{profile.bio}</p>
        </div>
      )}
    </Card>
  );
}
