import { Button } from '@/components/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <>
      <style>{`
        .hero { position: relative; min-height: calc(100vh - 84px); display: flex; align-items: center; overflow: hidden; padding: 84px 52px 0; }
        .map {
            position: absolute;
            left: 8%;
            right: -8%;
            top: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            pointer-events: none;
            z-index: 1;
        }
        .map img {
            width: 125%;
            height: auto;
            display: block;
            object-fit: contain;
            object-position: left center;
            transform: translateX(-6%);
            -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,.04) 5%, rgba(0,0,0,.35) 13%, rgba(0,0,0,1) 22%);
            mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,.04) 5%, rgba(0,0,0,.35) 13%, rgba(0,0,0,1) 22%);
        }
        .text { position: relative; z-index: 5; max-width: 555px; padding: 80px 0 100px; }
        .eyebrow { font-size: 10px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #7b8090; margin-bottom: 30px; }
        .text h1 { font-size: clamp(48px, 4.8vw, 72px); font-weight: 800; line-height: 1.06; letter-spacing: -.03em; color: #1b1f2d; margin-bottom: 32px; }
        .text h1 .bl { display: block; }
        .text h1 .sp { display: block; height: .22em; }
        .body { font-size: 15px; line-height: 1.72; color: #5e6370; max-width: 435px; margin-bottom: 50px; }
        .cta { display: flex; align-items: center; gap: 14px; }
        .btn-dark { background: #1b1f2d !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 14px 30px !important; font-size: 14px !important; font-weight: 600 !important; cursor: pointer; text-decoration: none; font-family: inherit; }
        .btn-light { background: #fff !important; color: #1b1f2d !important; border: 1.5px solid #d0d2d8 !important; border-radius: 8px !important; padding: 14px 30px !important; font-size: 14px !important; font-weight: 600 !important; cursor: pointer; text-decoration: none; font-family: inherit; }
        @media(max-width: 900px) { .map { left: 50%; } }
        @media(max-width: 650px) {
          .hero { padding: 0 20px; flex-direction: column; min-height: auto; }
          .text { padding: 48px 0 0; max-width: 100%; }
          .map { position: relative; left: auto; top: auto; right: auto; bottom: auto; width: 100%; height: 240px; margin-top: 32px; }
          .map img { object-position: center top; -webkit-mask-image: none; mask-image: none; }
        }
      `}</style>
      <div ref={ref} className={cn("hero transition-opacity duration-1000", isVisible ? "opacity-100" : "opacity-0")}>
        <div className="map">
          <img src="/images/hero-map.png" alt="Global Threat Monitoring" />
        </div>
        <div className="text">
          <div className="eyebrow">Enterprise Cybersecurity Consulting</div>
          <h1>
            Enterprise-Grade <span className="bl">Security.</span> <span className="sp"></span>Without Enterprise <span className="bl">Complexity.</span>
          </h1>
          <div className="body">
            XIFOZ helps organisations strengthen security through penetration testing, cloud security, compliance, managed security and advisory services.
          </div>
          <div className="cta">
            <Button to="/contact" className="btn-dark" variant="primary">Get Protection</Button>
            <Button to="/services" className="btn-light" variant="secondary">Explore Services</Button>
          </div>
        </div>
      </div>
    </>
  );
}