
import { Button } from "@/components/ui/button";
import { GroomerFormFields } from "@/components/groomer-onboarding/GroomerFormFields";
import { LoadingSpinner } from "@/components/groomer-onboarding/LoadingSpinner";
import { useGroomerAuth } from "@/components/groomer-onboarding/hooks/useGroomerAuth";
import { useGroomerForm } from "@/components/groomer-onboarding/hooks/useGroomerForm";

export default function GroomerOnboarding() {
  const { isAuthenticated, checkingAuth } = useGroomerAuth();
  const {
    formData,
    loading,
    validationErrors,
    handleFormDataChange,
    handleSpecializationToggle,
    handleImageChange,
    handleImagesChange,
    handleSubmit
  } = useGroomerForm();

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // This will be redirected in the checkAuth function
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Join as a Grooming Partner
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <GroomerFormFields
              formData={formData}
              validationErrors={validationErrors}
              onFormDataChange={handleFormDataChange}
              onSpecializationToggle={handleSpecializationToggle}
              onImageChange={handleImageChange}
              onImagesChange={handleImagesChange}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
