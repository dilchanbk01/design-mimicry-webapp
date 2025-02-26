
import { Instagram, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EventsFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#00D26A] py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-4">
            <a 
              href="https://instagram.com/petsu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
            >
              <Instagram size={16} />
              <span className="text-sm">Follow us</span>
            </a>
            <a 
              href="https://linkedin.com/company/petsu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
            >
              <Linkedin size={16} />
            </a>
          </div>

          <div className="flex space-x-4 text-xs text-white/90">
            <button 
              onClick={() => navigate('/privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-white/50">•</span>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-white transition-colors"
            >
              Terms & Conditions
            </button>
          </div>

          <p className="text-[10px] text-white/70">
            © {new Date().getFullYear()} Petsu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
