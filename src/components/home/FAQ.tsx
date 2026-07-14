"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

const faqs = [
  { question: 'How do I search for properties?', answer: 'Use our Explore page to search by location, property type, price range, and more. Our advanced filters help you find exactly what you\'re looking for. You can also use the quick search bar on the homepage to get started quickly.' },
  { question: 'Are all listings verified?', answer: 'Yes, every property listing on HomeNest goes through our verification process to ensure accuracy and authenticity. Our team reviews each listing before it goes live on the platform.' },
  { question: 'How can I list my property?', answer: 'Simply create an account, go to "Add Property", fill in the details including photos, location, and pricing, and your listing will be live after a quick review by our team.' },
  { question: 'Is there a fee for listing properties?', answer: 'Basic listings are completely free. We offer premium featured placement options for enhanced visibility. Contact us to learn more about our premium listing packages.' },
  { question: 'How do I contact a property agent?', answer: 'Each property listing includes agent contact information. You can also use our contact form for general inquiries, and our team will connect you with the right agent.' },
  { question: 'What cities do you cover?', answer: 'We currently cover Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, and Comilla, with more cities being added regularly. Check back often for expanded coverage.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => { setOpenIndex(openIndex === idx ? null : idx); };

  return (
    <section className="py-20 md:py-24 bg-neutral">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            FAQ
          </motion.span>
          <motion.h2 className="text-3xl md:text-4xl font-bold text-dark mb-3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Frequently Asked Questions
          </motion.h2>
          <motion.p className="text-muted max-w-xl mx-auto" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            Find answers to common questions about HomeNest
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:border-slate-200 transition-colors"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <button
                onClick={() => toggle(idx)}
                className="flex items-center justify-between w-full px-6 py-5 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-semibold text-dark pr-4">{faq.question}</span>
                <motion.span animate={{ rotate: openIndex === idx ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                  <HiChevronDown className="w-5 h-5 text-muted" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}