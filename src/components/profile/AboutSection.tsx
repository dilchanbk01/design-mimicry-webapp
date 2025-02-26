
export function AboutSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">About Petsu</h2>
        <p className="text-gray-600 mb-4">
          Petsu is a platform that helps pet owners find and book pet events, connect with verified veterinarians, and more.
        </p>
        <p className="text-gray-600 mb-4">
          Our mission is to make pet care accessible, convenient, and stress-free for both pets and their owners. We believe every pet deserves the best care possible.
        </p>
        <div className="mt-6">
          <h3 className="font-medium mb-2">Our Values</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Pet Safety First</li>
            <li>Quality Service</li>
            <li>Professional Excellence</li>
            <li>Community Building</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
