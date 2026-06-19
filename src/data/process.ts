export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    description: 'We begin by understanding your business, infrastructure, and security objectives through in-depth consultations and preliminary assessments.',
  },
  {
    number: '02',
    title: 'Assessment',
    description: 'Our experts conduct thorough technical assessments using automated tools and manual techniques to identify vulnerabilities and gaps.',
  },
  {
    number: '03',
    title: 'Remediation',
    description: 'We provide detailed, prioritized remediation guidance and work alongside your team to implement fixes and strengthen defenses.',
  },
  {
    number: '04',
    title: 'Continuous Protection',
    description: 'Security is an ongoing journey. We establish monitoring, regular assessments, and adaptive strategies to keep you protected as threats evolve.',
  },
];
