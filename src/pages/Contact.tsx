import { useMeta } from '@/hooks/useMeta';
import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { FAQSection } from '@/components/FAQSection';
import { contactFAQ } from '@/data/faq';
import { Button } from '@/components/Button';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:4000';

interface FormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Please enter a message (at least 10 characters).';
  }
  return errors;
}

function ContactHero() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.25} />
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Contact
          </span>
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6 transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Let us start a conversation
          </h1>
          <p
            className={cn(
              'text-lg md:text-xl text-xifoz-text-secondary leading-relaxed transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Whether you need a security assessment, compliance support, or ongoing protection,
            we are here to help.
          </p>
        </div>
      </Container>
    </section>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json() as { success: boolean; message: string; errors?: Record<string, string[]> };

      if (!res.ok || !json.success) {
        if (json.errors) {
          const mapped: FormErrors = {};
          for (const [field, msgs] of Object.entries(json.errors)) {
            mapped[field as keyof FormErrors] = msgs[0];
          }
          setErrors(mapped);
        } else {
          setErrors({ general: json.message ?? 'Something went wrong. Please try again.' });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-xifoz-surface border border-xifoz-text/5 rounded-card p-8 md:p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-xifoz-success/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-xifoz-success" />
        </div>
        <h3 className="text-xl font-semibold text-xifoz-text mb-2">Message sent</h3>
        <p className="text-sm text-xifoz-text-secondary">
          We have received your message and will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  const inputClass = (field: keyof FormErrors) =>
    cn(
      'w-full px-4 py-3 bg-xifoz-base border rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/40 focus:outline-none transition-colors',
      errors[field]
        ? 'border-red-500/50 focus:border-red-500/70'
        : 'border-xifoz-text/10 focus:border-xifoz-blue/30'
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Contact form">
      {errors.general && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{errors.general}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-xifoz-text mb-2">
            Full Name <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            value={formData.name}
            onChange={handleChange}
            className={inputClass('name')}
            placeholder="John Doe"
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-xifoz-text mb-2">
            Email Address <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            value={formData.email}
            onChange={handleChange}
            className={inputClass('email')}
            placeholder="john@company.com"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-xifoz-text mb-2">
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={formData.company}
            onChange={handleChange}
            className={inputClass('general')}
            placeholder="Company Name"
          />
        </div>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-xifoz-text mb-2">
            Service Interested In
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-xifoz-base border border-xifoz-text/10 rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select a service</option>
            <option value="Penetration Testing">Penetration Testing</option>
            <option value="Vulnerability Assessment">Vulnerability Assessment</option>
            <option value="Managed Security Services">Managed Security Services</option>
            <option value="SOC as a Service">SOC as a Service</option>
            <option value="Cloud Security">Cloud Security</option>
            <option value="Compliance Consulting">Compliance Consulting</option>
            <option value="Incident Response">Incident Response</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-xifoz-text mb-2">
          Message <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-invalid={!!errors.message}
          value={formData.message}
          onChange={handleChange}
          className={cn(inputClass('message'), 'resize-none')}
          placeholder="Tell us about your security needs..."
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-400">
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}

export default function Contact() {
  useMeta({
    title: 'Contact Us',
    description: 'Reach out to XIFOZ for a free security consultation. We will respond within 24 hours.',
    canonical: '/contact',
  });

  return (
    <>
      <ContactHero />

      <SectionWrapper background="dim" padding="normal">
        <Container>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-normal text-xifoz-text tracking-tight mb-6">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-normal text-xifoz-text tracking-tight mb-6">
                Contact information
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    content: (
                      <a href="mailto:support@xifoz.com" className="text-sm text-xifoz-text-secondary hover:text-xifoz-blue transition-colors">
                        support@xifoz.com
                      </a>
                    ),
                  },
                  {
                    icon: Phone,
                    label: 'Phone',
                    content: (
                      <a href="tel:+917999994828" className="text-sm text-xifoz-text-secondary hover:text-xifoz-blue transition-colors">
                        +91 7999994828
                      </a>
                    ),
                  },
                  {
                    icon: MapPin,
                    label: 'Office',
                    content: (
                      <p className="text-sm text-xifoz-text-secondary">
                        Gurugram, Haryana 122002<br />
                        India
                      </p>
                    ),
                  },
                  {
                    icon: Clock,
                    label: 'Business Hours',
                    content: (
                      <p className="text-sm text-xifoz-text-secondary">
                        Monday — Friday: 9:00 AM - 6:00 PM IST<br />
                        24/7 Incident Response Available
                      </p>
                    ),
                  },
                ].map(({ icon: Icon, label, content }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-xifoz-blue/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-xifoz-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-xifoz-text mb-1">{label}</p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper background="base">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
                Common questions
              </h2>
              <p className="text-base text-xifoz-text-secondary">
                Quick answers to frequently asked questions about contacting us.
              </p>
            </div>
            <FAQSection items={contactFAQ} />
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
