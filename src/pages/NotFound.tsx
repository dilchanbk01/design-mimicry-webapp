
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-800 mb-4">Oops! Page not found</p>
        <p className="text-gray-600 mb-6">
          The page at <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found.
        </p>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => window.location.href = "/"}
          >
            <Home className="h-4 w-4" /> 
            Return to Home
          </Button>
          
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-gray-600"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          {/* Only show this button if we're not already on an auth page */}
          {!location.pathname.includes("/auth") && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
              onClick={() => window.location.href = "/auth"}
            >
              Sign In / Register
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
