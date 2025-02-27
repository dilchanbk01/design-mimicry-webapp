
interface HomeAddressInputProps {
  homeAddress: string;
  onHomeAddressChange: (address: string) => void;
}

export function HomeAddressInput({ homeAddress, onHomeAddressChange }: HomeAddressInputProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
      <textarea
        value={homeAddress}
        onChange={(e) => onHomeAddressChange(e.target.value)}
        placeholder="Enter your complete address"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={3}
      />
    </div>
  );
}
