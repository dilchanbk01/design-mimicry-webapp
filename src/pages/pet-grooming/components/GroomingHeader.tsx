
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle2, Menu } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function GroomingHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center sm:justify-between">
        {/* Mobile Menu */}
        <div className="sm:hidden absolute left-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Petsu</SheetTitle>
                <SheetDescription>
                  Your pet grooming companion
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 flex flex-col gap-3">
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/">Home</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/pet-grooming">Grooming</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/find-vets">Find Vets</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/events">Events</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Larger and centered */}
        <Link 
          to="/" 
          className="flex items-center justify-center"
        >
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png" 
              alt="Petsu Logo" 
              className="h-12 w-auto"
            />
            <span className="ml-2 text-2xl font-bold text-green-600 hidden sm:inline-block">Petsu</span>
          </div>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden sm:flex items-center space-x-1">
          <Button asChild variant="ghost">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" className="bg-green-50 text-green-700">
            <Link to="/pet-grooming">Grooming</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/find-vets">Find Vets</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/events">Events</Link>
          </Button>
          <AuthButton />
        </nav>

        {/* Auth Button Only (Mobile) */}
        <div className="sm:hidden absolute right-4">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
