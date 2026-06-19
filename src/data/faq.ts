export interface FAQItem {
  question: string;
  answer: string;
}

export const homeFAQ: FAQItem[] = [
  {
    question: 'What industries does XIFOZ serve?',
    answer: 'XIFOZ serves organizations across healthcare, finance, retail, manufacturing, technology, education, government, and logistics. Our services are tailored to meet the unique regulatory and security requirements of each industry.',
  },
  {
    question: 'How quickly can XIFOZ respond to a security incident?',
    answer: 'Our incident response team is available 24/7 with guaranteed response times based on severity. Critical incidents receive an initial response within 15 minutes. We maintain a global team to ensure round-the-clock coverage.',
  },
  {
    question: 'What compliance frameworks does XIFOZ support?',
    answer: 'We support all major compliance frameworks including ISO 27001, SOC 2, GDPR, HIPAA, PCI DSS, NIST, FedRAMP, and industry-specific regulations. Our compliance consultants help you navigate requirements and maintain ongoing compliance.',
  },
  {
    question: 'How does XIFOZ differ from other cybersecurity providers?',
    answer: 'XIFOZ combines deep technical expertise with a business-first approach. We do not just find vulnerabilities — we help you understand business impact, prioritize remediation, and build long-term security resilience. Our proactive methodology focuses on preventing breaches, not just detecting them.',
  },
  {
    question: 'What is the typical engagement model?',
    answer: 'We offer flexible engagement models: project-based for specific assessments, managed services for ongoing security operations, and retained services for organizations needing dedicated security support. All engagements begin with a free consultation to understand your needs.',
  },
  {
    question: 'Does XIFOZ work with startups and small businesses?',
    answer: 'Absolutely. We believe strong security should be accessible to organizations of all sizes. We offer scaled services and pricing appropriate for startups and SMBs, with the flexibility to grow as your organization expands.',
  },
];

export const servicesFAQ: FAQItem[] = [
  {
    question: 'What is included in a penetration test?',
    answer: 'Our penetration tests include reconnaissance, vulnerability identification, exploitation attempts, and a comprehensive report with findings ranked by risk severity, business impact analysis, and detailed remediation guidance. We also offer remediation validation testing.',
  },
  {
    question: 'How often should vulnerability assessments be conducted?',
    answer: 'We recommend quarterly vulnerability assessments as a baseline, with continuous scanning for critical assets. Regulatory requirements may mandate more frequent assessments. Our managed vulnerability service provides ongoing scanning with prioritized remediation tracking.',
  },
  {
    question: 'What is SOC as a Service?',
    answer: 'SOC as a Service provides enterprise-grade security operations center capabilities without the capital investment of building your own SOC. We provide 24/7 monitoring, threat detection, incident analysis, and response coordination using advanced SIEM and threat intelligence platforms.',
  },
  {
    question: 'How does cloud security differ from traditional security?',
    answer: 'Cloud security requires understanding shared responsibility models, cloud-native controls, and dynamic infrastructure. We assess cloud configurations against CIS benchmarks, review IAM policies, evaluate container security, and ensure your cloud architecture follows security best practices.',
  },
  {
    question: 'What is the typical timeline for compliance certification?',
    answer: 'Timeline varies by framework and current maturity. SOC 2 typically takes 3-6 months, ISO 27001 can take 6-12 months, and PCI DSS depends on your environment complexity. We provide roadmaps with clear milestones and accelerate the process through our proven methodology.',
  },
];

export const contactFAQ: FAQItem[] = [
  {
    question: 'How do I schedule a consultation?',
    answer: 'You can schedule a free consultation by filling out the contact form, emailing us at contact@xifoz.com, or calling our office. We typically respond within 24 business hours to schedule an introductory call.',
  },
  {
    question: 'What happens during the initial consultation?',
    answer: 'During the free consultation, we discuss your current security posture, business objectives, regulatory requirements, and specific concerns. We then recommend a tailored approach and provide a detailed proposal with scope, timeline, and pricing.',
  },
  {
    question: 'Where is XIFOZ located?',
    answer: 'XIFOZ is headquartered in Gurugram, Haryana, India. We serve clients globally through a combination of on-site and remote delivery capabilities.',
  },
  {
    question: 'Do you offer ongoing support after project completion?',
    answer: 'Yes, we offer various support options including managed security services, quarterly check-ins, and annual re-assessments. Many clients transition from project-based work to ongoing managed services for continuous security improvement.',
  },
];
