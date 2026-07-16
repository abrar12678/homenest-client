"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiChevronRight, HiShieldCheck, HiLockClosed, HiEye, HiDatabase, HiClipboardList } from 'react-icons/hi';

const sections = [
  {
    icon: HiDatabase,
    title: 'Information We Collect',
    content: `When you create an account on HomeNest, we collect your name, email address, and phone number (if provided). We also collect property listing data you submit, including property details, images, and pricing information. Additionally, we automatically collect certain technical information such as your IP address, browser type, device information, and browsing patterns on our platform to improve your experience and ensure platform security. We use cookies and similar tracking technologies to maintain your session and remember your preferences.`,
  },
  {
    icon: HiEye,
    title: 'How We Use Your Information',
    content: `Your information is used to provide and improve our property listing services, facilitate communication between property seekers and agents, process transactions including featured property payments via Stripe, and send you relevant notifications about your listings and inquiries. We may also use aggregated, non-personal data for analytics purposes to understand platform usage patterns and improve our services. Your data is never sold to third parties for marketing purposes.`,
  },
  {
    icon: HiLockClosed,
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your personal information. All data transmissions are encrypted using TLS/SSL protocols. User passwords are hashed using bcrypt with a 12-round salt and are never stored in plain text. Our MongoDB database is hosted on secure infrastructure with regular backups. We use JWT (JSON Web Tokens) for authentication with configurable expiration times. However, no method of electronic transmission or storage is 100% secure, and we encourage you to use strong, unique passwords for your account.`,
  },
  {
    icon: HiClipboardList,
    title: 'Cookies & Tracking',
    content: `HomeNest uses essential cookies to maintain your authenticated session (stored in localStorage). We use Google Analytics cookies to understand how users interact with our platform. You can control cookie preferences through your browser settings. Disabling cookies may affect the functionality of certain features on our platform. We do not use third-party advertising cookies or share your browsing data with advertisers.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="pt-20 pb-0 bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <nav className="flex justify-center items-center gap-2 text-sm text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <HiChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">Privacy Policy</span>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Your privacy matters to us. Learn how HomeNest collects, uses, and protects your data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6 mb-12"
          >
            <div className="flex items-start gap-3">
              <HiShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Last Updated: July 2026</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  This privacy policy describes how HomeNest (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects your personal information when you use our platform. By using HomeNest, you agree to the practices described below.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-dark">{section.title}</h2>
                </div>
                <p className="text-muted leading-relaxed text-sm md:text-base pl-0 md:pl-[52px]">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-6 md:p-8 text-center"
          >
            <h3 className="text-lg font-bold text-dark mb-2">Questions About Our Privacy Practices?</h3>
            <p className="text-sm text-muted mb-5 max-w-md mx-auto">
              If you have any questions or concerns about this privacy policy, please reach out to our team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
              Contact Us
              <HiChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}