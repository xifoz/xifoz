import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { GridCoverage } from '@/components/GridCoverage';

export default function Terms() {
  useMeta({ title: 'Terms of Service', description: "Read the XIFOZ terms of service governing use of our website and consulting services.", canonical: '/terms' });
  return (
    <>
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-base overflow-hidden">
        <GridCoverage className="absolute inset-0" opacity={0.25} />
        <Container className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg text-xifoz-text-secondary">
            Last updated: June 2026
          </p>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose-xifoz">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the XIFOZ website and services, you accept and agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Services Description</h2>
          <p>
            XIFOZ provides cybersecurity consulting, assessment, and managed security services. The specific scope, deliverables, and terms of each engagement are defined in individual service agreements.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and software, is the property of XIFOZ and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
          </p>

          <h2>4. Confidentiality</h2>
          <p>
            XIFOZ maintains strict confidentiality regarding client information and findings. All engagement results, reports, and communications are treated as confidential unless otherwise agreed in writing.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, XIFOZ shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of our services or website.
          </p>

          <h2>6. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without warranties of any kind, either express or implied. While we strive for accuracy, we do not warrant that our services will be uninterrupted or error-free.
          </p>

          <h2>7. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless XIFOZ and its employees, contractors, and agents from any claims, damages, or expenses arising from your use of our services or violation of these terms.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services constitutes acceptance of the modified terms.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            For questions about these Terms & Conditions, please contact us at legal@xifoz.com or through our contact page.
          </p>
        </div>
      </Container>
    </>
  );
}
