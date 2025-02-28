
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#00a455] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Petsu</h3>
            <p className="text-sm text-white/80">
              Making pet care accessible, convenient, and stress-free for pet parents across India.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://linkedin.com/company/petsu" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Connect with us on LinkedIn"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://twitter.com/petsuindia" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://facebook.com/petsuindia" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Like us on Facebook"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/events')} className="hover:underline">
                  Pet Events
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pet-grooming')} className="hover:underline">
                  Pet Grooming
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/find-vets')} className="hover:underline">
                  Veterinary Consultations
                </button>
              </li>
              <li>
                <button className="hover:underline" onClick={() => navigate('/')}>
                  Pet Essentials (Coming Soon)
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Pet Parents</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/blog')} className="hover:underline">
                  Pet Care Blog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/profile')} className="hover:underline">
                  My Bookings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/events')} className="hover:underline">
                  Dog Events in Bangalore
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pet-grooming')} className="hover:underline">
                  Dog Grooming Services
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Service Providers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/vet-auth')} className="hover:underline">
                  Join as Veterinarian
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/groomer-auth')} className="hover:underline">
                  Join as Pet Groomer
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/events/create')} className="hover:underline">
                  Host a Pet Event
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="bg-white/20 my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-white/70">
            © {currentYear} Petsu. All rights reserved.
          </div>
          
          <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2 text-xs text-white/70">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <button onClick={() => navigate('/cancellation-policy')} className="hover:text-white transition-colors">
              Cancellation Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
