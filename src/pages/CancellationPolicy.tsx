
import { Header } from "@/components/layout/Header";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isScrolled={false} selectedCity={null} onCitySelect={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto prose prose-headings:text-accent">
          <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>
          
          <div className="bg-primary/5 p-6 rounded-lg mb-8">
            <p className="text-lg font-medium text-gray-800">
              Petsu currently does not offer cancellations once a booking or order has been placed. However, this policy outlines how you can request a refund under specific conditions.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Eligibility</h2>
          <p>You may be eligible for a refund in the following cases:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>The service was not rendered or was significantly different from the description.</li>
            <li>Technical issues prevented the service from being delivered.</li>
            <li>Duplicate charges or incorrect billing.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How to Request a Refund</h2>
          <p>To request a refund, please:</p>
          <ol className="list-decimal pl-6 mb-6">
            <li>Contact our support team within 24 hours of the incident.</li>
            <li>Provide your order/booking details and the reason for the refund.</li>
            <li>Include any relevant documentation or evidence.</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Processing Time</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Refund requests are typically processed within 5-7 business days.</li>
            <li>If your refund is approved, the amount will be credited to your original payment method within 7-10 days.</li>
            <li>The actual time to receive the refund may vary depending on your payment method and financial institution.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            For any questions about our cancellation and refund policy, please contact us at{" "}
            <a href="mailto:petsubk@gmail.com" className="text-primary hover:underline">
              petsubk@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CancellationPolicy;
