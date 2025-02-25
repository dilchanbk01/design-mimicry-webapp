
import { Header } from "@/components/layout/Header";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isScrolled={false} selectedCity={null} onCitySelect={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto prose prose-headings:text-accent">
          <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
          <p className="text-gray-600 mb-6">Welcome to Petsu! By using our website and services, you agree to the following terms:</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. General Use</h2>
          <p>
            Petsu provides a platform for pet owners to find events, consult with vets, and shop for pet-related products.
            You must be at least 18 years old to use our services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Veterinary Consultations</h2>
          <p>
            Online vet consultations are for informational purposes only and do not replace in-person veterinary care.
            Petsu is not responsible for any medical advice given by vets on our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Events & Services</h2>
          <p>
            Petsu only acts as a platform for event organizers and service providers. We are not liable for the quality or outcome of any events or services booked through our site.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payments & Refunds</h2>
          <p>
            Payments for services are processed securely. Refunds are subject to the policies of the individual service providers.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Users must provide accurate information when booking services.</li>
            <li>Any inappropriate behavior or misuse of the platform may result in account suspension.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            Petsu is not responsible for any damages, injuries, or losses resulting from the use of our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Privacy</h2>
          <p>
            We value your privacy. Please review our{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>{" "}
            for details on how we collect and use your information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Governing Law</h2>
          <p>
            These Terms & Conditions are governed by and construed in accordance with the laws of India, 
            without regard to its conflict of law principles. Any disputes arising from these terms shall 
            be resolved in the courts of India.
          </p>

          <p className="mt-4 text-gray-600">
            This website is owned by Dilchan Biswakarma
          </p>

          <p className="mt-8">
            By continuing to use Petsu, you agree to these terms. If you have any questions, contact us at{" "}
            <a href="mailto:petsubk@gmail.com" className="text-primary hover:underline">
              petsubk@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
