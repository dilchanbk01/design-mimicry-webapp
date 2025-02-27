
import { Instagram } from "lucide-react";

export function EventFooter() {
  return (
    <footer className="mt-8 p-6 bg-gray-50 rounded-b-3xl">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2">
          <a 
            href="https://instagram.com/petsu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-[#00D26A] transition-colors flex items-center gap-2"
          >
            <Instagram className="h-5 w-5" />
            <span>Follow us</span>
          </a>
        </div>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Petsu. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
