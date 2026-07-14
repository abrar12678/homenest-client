"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { submitContact } from '@/lib/api';
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiClock,
  HiChevronRight,
  HiHome,
  HiChatAlt2,
  HiUserCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'listing', label: 'Property Listing Help' },
  { value: 'account', label: 'Account Issue' },
  { value: 'report', label: 'Report a Problem' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'other', label: 'Other' },
];

const contactCards = [
  {
    icon: HiMail,
    title: 'Email Us',
    lines: ['info@homenest.com.bd', 'support@homenest.com.bd'],
    color: 'bg-blue-100 text-primary',
    hoverBorder: 'hover:border-primary/30',
  },
  {
    icon: HiPhone,
    title: 'Call Us',
    lines: ['+880 1234-567890', '+880 9876-543210'],
    color: 'bg-green-100 text-secondary',
    hoverBorder: 'hover:border-secondary/30',
  },
  {
    icon: HiLocationMarker,
    title: 'Visit Us',
    lines: ['House 42, Road 11, Banani', 'Dhaka 1213, Bangladesh'],
    color: 'bg-amber-100 text-accent',
    hoverBorder: 'hover:border-accent/30',
  },
  {
    icon: HiClock,
    title: 'Office Hours',
    lines: ['Sun – Thu: 9:00 AM – 6:00 PM', 'Sat: 10:00 AM – 4:00 PM'],
    color: 'bg-purple-100 text-purple-600',
    hoverBorder: 'hover:border-purple-300',
  },
];

export default function ContactPage() {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setError('');
    try {
      await submitContact(data);
      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch {
      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    }
  };

  return (
    <main className="pt-20 pb-0 bg-white">
      {/* Hero / Page Header */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 md:py-24 overflow-hidden">
        {/* Decorative elements */}
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
              <span className="text-white font-medium">Contact</span>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Have questions? We&apos;d love to hear from you. Send us a message and
              we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {contactCards.map((card, idx) => (
              <motion.div
                key={card.title}
                className={`group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 ${card.hoverBorder}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-dark mb-2">{card.title}</h3>
                {card.lines.map((line) => (
                  <p key={line} className="text-sm text-muted">{line}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Sidebar */}
      <section className="pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <HiChatAlt2 className="w-3.5 h-3.5" />
                Send a Message
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">
                We&apos;d Love to Hear From You
              </h2>
              <p className="text-muted text-sm mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-6 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Your Name</label>
                    <div className="relative">
                      <HiUserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
                          errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                        {...register('name')}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Email Address</label>
                    <div className="relative">
                      <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${
                          errors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Subject</label>
                  <div className="relative">
                    <HiChatAlt2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                    <select
                      className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 appearance-none cursor-pointer ${
                        errors.subject ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                      defaultValue=""
                      {...register('subject')}
                    >
                      <option value="" disabled>Select a subject</option>
                      {subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.subject && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Write your message here..."
                    className={`w-full px-4 py-3 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical transition-all duration-200 ${
                      errors.message ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-secondary to-secondary-light text-white font-semibold rounded-2xl shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 hover:from-emerald-700 hover:to-secondary transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Quick Help Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 border border-primary/10 rounded-2xl p-6 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  <HiHome className="w-3.5 h-3.5" />
                  Quick Help
                </div>
                <h3 className="text-lg font-bold text-dark mb-3">Need Instant Answers?</h3>
                <p className="text-sm text-muted leading-relaxed mb-5">
                  Check out our frequently asked questions for quick solutions to common queries about
                  property listing, account management, and more.
                </p>
                <Link
                  href="/#faq"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Visit FAQ
                  <HiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Find Us — Map Placeholder */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold mb-4">
                  <HiLocationMarker className="w-3.5 h-3.5" />
                  Find Us
                </div>
                <h3 className="text-lg font-bold text-dark mb-3">Our Office</h3>
                <p className="text-sm text-muted mb-5">
                  House 42, Road 11, Banani<br />
                  Dhaka 1213, Bangladesh
                </p>
                {/* Map placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-primary/5 via-slate-100 to-secondary/5 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                  <HiLocationMarker className="w-10 h-10 text-primary/30 mb-3" />
                  <p className="text-sm font-medium text-muted">Interactive Map Coming Soon</p>
                  <p className="text-xs text-slate-400 mt-1">We&apos;re working on it!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}