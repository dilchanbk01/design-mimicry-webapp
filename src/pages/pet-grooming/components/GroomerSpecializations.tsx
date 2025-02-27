
interface GroomerSpecializationsProps {
  specializations: string[];
}

export function GroomerSpecializations({ specializations }: GroomerSpecializationsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-green-800">Specializations</h2>
      <div className="flex flex-wrap gap-2">
        {specializations.map((specialization: string) => (
          <span
            key={specialization}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
          >
            {specialization}
          </span>
        ))}
      </div>
    </div>
  );
}
