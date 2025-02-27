
import { GroomingHeader } from "../GroomingHeader";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
      <GroomingHeader />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Loading booking details...</p>
        </div>
      </div>
    </div>
  );
}
