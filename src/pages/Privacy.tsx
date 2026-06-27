import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { GridCoverage } from '@/components/GridCoverage';

export default function Privacy() {
  useMeta({ title: 'Privacy Policy', description: "Read the XIFOZ privacy policy to understand how we collect, use, and protect your information.", canonical: '/privacy' });
  return (
    <>
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-base overflow-hidden">
        <GridCoverage className="absolute inset-0" opacity={0.25} />
        <Container className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-xifoz-text-secondary">
            Last updated: December 2024
          </p>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose-xifoz">
          <h2>1. Introduction</h2>
          <p>
            XIFOZ ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and job title when you contact us or request our services.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.</li>
            <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your browsing experience.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send you technical notices, updates, and administrative messages</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Protect against fraudulent, unauthorized, or illegal activity</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except as described in this policy. We may share information with:
          </p>
          <ul>
            <li>Trusted service providers who assist us in operating our website and conducting our business</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing of your personal information</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@xifoz.com or through our contact page.
          </p>
        </div>
      </Container>
    </>
  );
}
