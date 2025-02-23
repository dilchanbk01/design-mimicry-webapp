
import type { VetProfile } from "@/types/vet";

interface ProfileSectionProps {
  profile: VetProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome, Dr. {profile.clinic_name}</h1>
      <div className="text-sm text-gray-500">
        {profile.application_status === 'pending' && (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md mb-4">
            Your application is currently under review. We'll notify you once it's approved.
          </div>
        )}
        <p className="mb-2">
          <strong>Specializations:</strong>{" "}
          {profile.specializations?.join(", ")}
        </p>
        <p className="mb-2">
          <strong>Years of Experience:</strong>{" "}
          {profile.years_of_experience}
        </p>
        {profile.bio && (
          <p className="mb-2">
            <strong>Bio:</strong> {profile.bio}
          </p>
        )}
      </div>
    </div>
  );
}
