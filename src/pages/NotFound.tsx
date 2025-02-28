
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-800 mb-4">Oops! Page not found</p>
        <p className="text-gray-600 mb-6">
          The page at <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found.
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline block mb-2">
          Return to Home
        </a>
        <a href="/admin/auth" className="text-blue-500 hover:text-blue-700 underline block">
          Go to Admin Login
        </a>
      </div>
    </div>
  );
};

export default NotFound;
