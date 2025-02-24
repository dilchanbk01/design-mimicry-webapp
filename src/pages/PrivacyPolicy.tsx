
import { Header } from "@/components/layout/Header";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isScrolled={false} selectedCity={null} onCitySelect={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto prose prose-headings:text-accent">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last Updated: 24 May 2025</p>

          <p className="mb-6">
            Welcome to Petsu! Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website and services, including chat, video calls, and file sharing with veterinarians. By using Petsu, you agree to the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect different types of information to provide and improve our services:</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">a. Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, email address, phone number</li>
            <li>Payment details (if applicable)</li>
            <li>Profile information (including pet details)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">b. Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Chat and video call history with vets</li>
            <li>Files shared through our platform</li>
            <li>Log data such as IP addresses, browser type, and access times</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">c. Cookies and Tracking Technologies</h3>
          <p>We use cookies to enhance user experience and track website activity.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information collected for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and managing vet consultations</li>
            <li>Improving our platform and services</li>
            <li>Processing payments and transactions</li>
            <li>Ensuring security and preventing fraud</li>
            <li>Communicating with users about updates or promotional offers</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Share Your Information</h2>
          <p>We do not sell your personal information. However, we may share it with:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Veterinarians: To facilitate consultations and prescriptions</li>
            <li>Service Providers: For payment processing, hosting, and analytics</li>
            <li>Legal Authorities: When required by law or to protect our users</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement security measures to protect your data, including encryption and access controls. 
            However, no method of transmission is 100% secure, so we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access, update, or delete your personal data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Links and Services</h2>
          <p>
            Petsu may contain links to third-party websites. We are not responsible for their privacy practices. 
            Please review their policies before sharing your information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect information from children.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be posted on this page with the updated date.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:petsupetsu@gmail.com" className="text-primary hover:underline">
              petsupetsu@gmail.com
            </a>
          </p>

          <p className="mt-8 mb-12">Thank you for using Petsu!</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
