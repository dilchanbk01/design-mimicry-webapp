
interface GroomerBioProps {
  bio: string | null | undefined;
}

export function GroomerBio({ bio }: GroomerBioProps) {
  if (!bio) return null;
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">About</h2>
      <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
    </div>
  );
}
