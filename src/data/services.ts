export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  idealFor: string[];
}

export const services: Service[] = [
  {
    id: 'penetration-testing',
    title: 'Penetration Testing',
    description: 'Simulate real-world attacks to identify exploitable vulnerabilities in your infrastructure, applications, and networks before malicious actors do.',
    icon: 'Sword',
    features: [
      'External & internal network penetration testing',
      'Web application security testing',
      'Mobile application testing',
      'Social engineering assessments',
      'Detailed remediation reports',
    ],
    idealFor: ['Enterprises', 'SaaS Companies', 'Financial Services', 'Healthcare'],
  },
  {
    id: 'vulnerability-assessment',
    title: 'Vulnerability Assessment',
    description: 'Comprehensive scanning and analysis of your systems to identify security weaknesses, misconfigurations, and missing patches.',
    icon: 'ScanSearch',
    features: [
      'Automated vulnerability scanning',
      'Manual validation of findings',
      'Risk-based prioritization',
      'Remediation guidance',
      'Continuous monitoring setup',
    ],
    idealFor: ['SMBs', 'Mid-sized Businesses', 'Startups', 'Manufacturing'],
  },
  {
    id: 'managed-security',
    title: 'Managed Security Services',
    description: '24/7 security monitoring and management of your security infrastructure, allowing your team to focus on core business objectives.',
    icon: 'ShieldCheck',
    features: [
      '24/7 security monitoring',
      'Threat detection & response',
      'Firewall management',
      'Security device management',
      'Monthly security reports',
    ],
    idealFor: ['SMBs', 'Enterprises', 'Healthcare', 'Education'],
  },
  {
    id: 'soc-as-a-service',
    title: 'SOC as a Service',
    description: 'Enterprise-grade Security Operations Center capabilities without the overhead of building and maintaining your own SOC.',
    icon: 'MonitorCheck',
    features: [
      '24/7 threat monitoring',
      'Incident detection & analysis',
      'Alert triage & escalation',
      'Threat intelligence integration',
      'SIEM management',
    ],
    idealFor: ['Mid-sized Businesses', 'Enterprises', 'Government', 'Finance'],
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security',
    description: 'Secure your cloud infrastructure across AWS, Azure, and GCP with comprehensive assessments, architecture reviews, and ongoing monitoring.',
    icon: 'CloudCog',
    features: [
      'Cloud security posture assessment',
      'IAM configuration review',
      'Container & Kubernetes security',
      'Serverless security review',
      'Cloud compliance mapping',
    ],
    idealFor: ['SaaS Companies', 'Startups', 'Technology', 'Enterprises'],
  },
  {
    id: 'web-application-security',
    title: 'Web Application Security',
    description: 'Dedicated security testing and hardening for web applications, from OWASP Top 10 coverage to business logic testing.',
    icon: 'GlobeLock',
    features: [
      'OWASP Top 10 assessment',
      'Authentication & session testing',
      'Business logic validation',
      'API security testing',
      'Secure code review',
    ],
    idealFor: ['SaaS Companies', 'E-commerce', 'Technology', 'Startups'],
  },
  {
    id: 'api-security',
    title: 'API Security',
    description: 'Specialized testing and protection for REST, GraphQL, and SOAP APIs to prevent data breaches and unauthorized access.',
    icon: 'Webhook',
    features: [
      'API endpoint discovery',
      'Authentication bypass testing',
      'Rate limiting assessment',
      'Data validation testing',
      'API gateway security review',
    ],
    idealFor: ['SaaS Companies', 'Fintech', 'Technology', 'Enterprises'],
  },
  {
    id: 'network-security',
    title: 'Network Security',
    description: 'Design, implement, and audit secure network architectures that protect your critical assets from internal and external threats.',
    icon: 'Network',
    features: [
      'Network architecture review',
      'Firewall rule audit',
      'Segmentation assessment',
      'VPN & remote access review',
      'Wireless security testing',
    ],
    idealFor: ['Enterprises', 'Manufacturing', 'Government', 'Healthcare'],
  },
  {
    id: 'incident-response',
    title: 'Incident Response',
    description: 'Rapid, structured response to security incidents to minimize damage, restore operations, and prevent future occurrences.',
    icon: 'Siren',
    features: [
      '24/7 incident hotline',
      'Forensic investigation',
      'Malware analysis',
      'Containment & eradication',
      'Post-incident reporting',
    ],
    idealFor: ['All Organizations', 'Critical Infrastructure', 'Finance', 'Healthcare'],
  },
  {
    id: 'compliance-consulting',
    title: 'Compliance Consulting',
    description: 'Navigate complex regulatory requirements with expert guidance for ISO 27001, SOC 2, GDPR, HIPAA, PCI DSS, and more.',
    icon: 'FileCheck',
    features: [
      'Gap assessment against frameworks',
      'Policy & procedure development',
      'Evidence preparation',
      'Audit support',
      'Continuous compliance monitoring',
    ],
    idealFor: ['Healthcare', 'Finance', 'SaaS Companies', 'Government'],
  },
  {
    id: 'security-audits',
    title: 'Security Audits',
    description: 'Independent, thorough security audits to assess your security posture and provide actionable recommendations.',
    icon: 'ClipboardCheck',
    features: [
      'Comprehensive security review',
      'Control effectiveness testing',
      'Risk assessment',
      'Executive summary report',
      'Remediation roadmap',
    ],
    idealFor: ['Enterprises', 'Government', 'Finance', 'Mid-sized Businesses'],
  },
  {
    id: 'security-awareness',
    title: 'Security Awareness Training',
    description: 'Transform your employees into your first line of defense with engaging, practical security awareness programs.',
    icon: 'Users',
    features: [
      'Phishing simulation campaigns',
      'Interactive training modules',
      'Role-based training paths',
      'Progress tracking & reporting',
      'Custom content development',
    ],
    idealFor: ['All Organizations', 'Healthcare', 'Education', 'SMBs'],
  },
];
