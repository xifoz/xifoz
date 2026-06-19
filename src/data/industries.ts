export interface Industry {
  id: string;
  title: string;
  description: string;
  image: string;
  challenges: string[];
  solutions: string[];
}

export const industries: Industry[] = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Protect patient data, ensure HIPAA compliance, and secure connected medical devices against evolving cyber threats.',
    image: '/images/industries/healthcare.jpg',
    challenges: [
      'Protecting sensitive patient health information (PHI)',
      'Securing connected medical devices and IoT',
      'Meeting HIPAA and HITECH compliance requirements',
      'Defending against ransomware targeting hospitals',
    ],
    solutions: [
      'HIPAA compliance assessment and remediation',
      'Medical device security testing',
      '24/7 security monitoring for healthcare environments',
      'Incident response planning for healthcare organizations',
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Safeguard financial data, prevent fraud, and maintain regulatory compliance in a heavily regulated industry.',
    image: '/images/industries/finance.jpg',
    challenges: [
      'Protecting financial transactions and customer data',
      'Meeting PCI DSS and banking regulations',
      'Preventing fraud and unauthorized access',
      'Securing digital banking platforms',
    ],
    solutions: [
      'PCI DSS compliance consulting',
      'Application security for fintech platforms',
      'Fraud detection and prevention strategies',
      'Network security for banking infrastructure',
    ],
  },
  {
    id: 'retail',
    title: 'Retail',
    description: 'Secure e-commerce platforms, protect customer payment data, and defend against supply chain attacks.',
    image: '/images/industries/retail.jpg',
    challenges: [
      'Securing e-commerce platforms and payment systems',
      'Protecting customer PII and purchase history',
      'Defending against supply chain attacks',
      'Securing POS systems and in-store networks',
    ],
    solutions: [
      'E-commerce application security testing',
      'POS system security assessment',
      'PCI DSS compliance support',
      'Supply chain security evaluation',
    ],
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Protect OT/IT convergence, secure industrial control systems, and safeguard intellectual property.',
    image: '/images/industries/manufacturing.jpg',
    challenges: [
      'Securing OT/IT converged environments',
      'Protecting industrial control systems (ICS/SCADA)',
      'Safeguarding intellectual property and trade secrets',
      'Minimizing production downtime from cyber incidents',
    ],
    solutions: [
      'ICS/SCADA security assessment',
      'OT network segmentation review',
      'Industrial IoT security testing',
      'Business continuity planning',
    ],
  },
  {
    id: 'technology',
    title: 'Technology',
    description: 'Secure your software development lifecycle, protect cloud infrastructure, and build secure products.',
    image: '/images/industries/technology.jpg',
    challenges: [
      'Securing CI/CD pipelines and DevOps workflows',
      'Protecting cloud infrastructure and SaaS platforms',
      'Managing third-party and open-source risk',
      'Meeting customer security requirements',
    ],
    solutions: [
      'DevSecOps integration consulting',
      'Cloud security architecture review',
      'Software composition analysis (SCA)',
      'Customer-facing security audit support',
    ],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Protect student data, secure research assets, and maintain compliance with educational privacy laws.',
    image: '/images/industries/education.jpg',
    challenges: [
      'Protecting student records and academic data',
      'Securing research data and intellectual property',
      'Meeting FERPA compliance requirements',
      'Defending against attacks on limited IT budgets',
    ],
    solutions: [
      'FERPA compliance assessment',
      'Cost-effective security monitoring',
      'Security awareness training for staff and students',
      'Network security for campus environments',
    ],
  },
  {
    id: 'government',
    title: 'Government',
    description: 'Meet stringent security requirements, protect classified and citizen data, and defend against nation-state threats.',
    image: '/images/industries/government.jpg',
    challenges: [
      'Meeting stringent federal and state security requirements',
      'Protecting citizen data and critical infrastructure',
      'Defending against nation-state threat actors',
      'Ensuring continuity of government services',
    ],
    solutions: [
      'FedRAMP and NIST compliance support',
      'Critical infrastructure security assessment',
      'Advanced threat detection and response',
      'Security clearance-ready consulting teams',
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics',
    description: 'Secure supply chain systems, protect shipment data, and ensure operational continuity across global networks.',
    image: '/images/industries/logistics.jpg',
    challenges: [
      'Securing global supply chain management systems',
      'Protecting shipment tracking and logistics data',
      'Defending against operational disruption attacks',
      'Integrating security across partner networks',
    ],
    solutions: [
      'Supply chain security assessment',
      'TMS and WMS application security',
      'Third-party vendor risk assessment',
      'Operational continuity planning',
    ],
  },
];
