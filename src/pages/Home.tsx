import { lazy, Suspense } from 'react';
import { useMeta } from '@/hooks/useMeta';

const HeroSection = lazy(() => import('@/sections/HeroSection').then(m => ({ default: m.HeroSection })));
const CoverageGrid = lazy(() => import('@/sections/CoverageGrid').then(m => ({ default: m.CoverageGrid })));
const WhyChooseSection = lazy(() => import('@/sections/WhyChooseSection').then(m => ({ default: m.WhyChooseSection })));
const SystemicResilience = lazy(() => import('@/sections/SystemicResilience').then(m => ({ default: m.SystemicResilience })));
const MonitoredInfrastructure = lazy(() => import('@/sections/MonitoredInfrastructure').then(m => ({ default: m.MonitoredInfrastructure })));
const FrameworksSection = lazy(() => import('@/sections/FrameworksSection').then(m => ({ default: m.FrameworksSection })));
const ProcessSection = lazy(() => import('@/sections/ProcessSection').then(m => ({ default: m.ProcessSection })));
const SecureVault = lazy(() => import('@/sections/SecureVault').then(m => ({ default: m.SecureVault })));
const FAQSection = lazy(() => import('@/sections/FAQSection').then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import('@/sections/CTASection').then(m => ({ default: m.CTASection })));

export default function Home() {
  useMeta({ title: 'Cybersecurity Consulting for Modern Organizations', description: "XIFOZ delivers penetration testing, managed security, compliance consulting, and cloud security for organizations that cannot afford to be breached.", canonical: '/' });
  return (
    <Suspense fallback={null}>
      <HeroSection />
      <CoverageGrid />
      <WhyChooseSection />
      <SystemicResilience />
      <MonitoredInfrastructure />
      <FrameworksSection />
      <ProcessSection />
      <SecureVault />
      <FAQSection />
      <CTASection />
    </Suspense>
  );
}
