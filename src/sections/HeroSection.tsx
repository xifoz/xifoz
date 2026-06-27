import { Button } from '@/components/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { Container } from '@/components/Container';

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div 
      ref={ref} 
      className={cn(
        "relative min-h-[85svh] md:min-h-[calc(100vh-84px)] flex items-center overflow-hidden transition-opacity duration-1000 bg-xifoz-base pt-[env(safe-area-inset-top)]",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 md:inset-y-0 md:right-[-8%] md:left-[35%] lg:left-[45%] flex items-start md:items-center justify-end md:justify-start pointer-events-none z-0 md:z-[1] opacity-[0.12] md:opacity-100 overflow-hidden md:overflow-visible">
        <img 
          src="/images/hero-map.png" 
          alt="Global Threat Monitoring" 
          className="w-[180%] md:w-[125%] h-auto md:h-auto object-contain object-right-top md:object-left mask-image-fade max-w-none relative right-[-20%] md:right-auto"
        />
      </div>

      <Container className="relative z-10 w-full h-full flex flex-col md:flex-row justify-center md:justify-start items-center pt-24 md:pt-0 pb-12 md:pb-0">
        <div className="w-full md:max-w-2xl lg:max-w-3xl relative z-20">
          <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-xifoz-text-secondary mb-6 md:mb-8">
            Enterprise Cybersecurity Consulting
          </div>
          <h1 className="text-fluid-display-lg font-extrabold text-xifoz-text leading-tight mb-8 max-w-xl">
            Enterprise-Grade <span className="block">Security.</span> <div className="h-2 md:h-4"></div>Without Enterprise <span className="block">Complexity.</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-xifoz-text-secondary max-w-[435px] mb-10 md:mb-12">
            XIFOZ helps organisations strengthen security through penetration testing, cloud security, compliance, managed security and advisory services.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button to="/contact" size="lg" variant="primary">Get Protection</Button>
            <Button to="/services" size="lg" variant="outline">Explore Services</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}