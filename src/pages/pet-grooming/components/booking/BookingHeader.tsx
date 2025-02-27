
interface BookingHeaderProps {
  groomerName: string;
}

export function BookingHeader({ groomerName }: BookingHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
      <p className="text-gray-600 mt-1">with {groomerName}</p>
    </div>
  );
}
