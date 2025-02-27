
import { useNavigate } from "react-router-dom";

export function BlogHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/0fab9a9b-a614-463c-bac7-5446c69c4197.png" 
              alt="Petsu"
              className="h-10 cursor-pointer"
              onClick={() => navigate('/')}
            />
            <span 
              className="font-semibold text-accent text-xl cursor-pointer"
              onClick={() => navigate('/blog')}
            >
              Blog
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-sm text-gray-600 hover:text-accent"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/blog/category/grooming')} 
              className="text-sm text-gray-600 hover:text-accent"
            >
              Grooming
            </button>
            <button 
              onClick={() => navigate('/blog/category/events')} 
              className="text-sm text-gray-600 hover:text-accent"
            >
              Events
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
