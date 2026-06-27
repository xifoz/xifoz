import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { Button } from '@/components/Button';
import { GridCoverage } from '@/components/GridCoverage';

export default function NotFound() {
  useMeta({ title: 'Page Not Found', description: "The page you were looking for could not be found. Return to the XIFOZ homepage.", canonical: undefined });
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-xifoz-dark-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.3} />
      <Container className="relative z-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-8xl md:text-9xl font-normal text-xifoz-dark-text tracking-tight mb-4">
            404
          </h1>
          <p className="text-lg text-xifoz-dark-text-muted mb-2">
            Page not found
          </p>
          <p className="text-sm text-xifoz-dark-text-muted/70 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/" size="lg">
              Back to Home
            </Button>
            <Button to="/contact" variant="outline" size="lg">
              Contact Support
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
