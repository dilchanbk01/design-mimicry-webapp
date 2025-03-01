
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  logoSrc?: string;
  showBackButton?: boolean;
  backgroundColor?: string;
}

export function AuthContainer({
  children,
  title,
  logoSrc,
  showBackButton = true,
  backgroundColor = "bg-green-50"
}: AuthContainerProps) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${backgroundColor} flex flex-col`}>
      {showBackButton && (
        <div className="container p-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-green-700 hover:bg-green-100 hover:text-green-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="mb-8 flex flex-col items-center">
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="h-16 mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-green-800">{title}</h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
