"use client";

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiMail,
  HiPhone,
  HiLocationMarker,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa6';

const propertyTypes = [
  { href: '/properties?type=apartment', label: 'Apartments' },
  { href: '/properties?type=villa', label: 'Villas' },
  { href: '/properties?type=commercial', label: 'Commercial Spaces' },
  { href: '/properties?type=land', label: 'Land & Plots' },
];

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaXTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const { isAuthenticated } = useAuthStore();

  const quickLinks = isAuthenticated
    ? [
        { href: '/', label: 'Home' },
        { href: '/properties', label: 'Explore Properties' },
        { href: '/properties/new', label: 'List Property' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/about', label: 'About Us' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/properties', label: 'Explore Properties' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/register', label: 'Get Started' },
      ];

  return (
    <footer className="bg-dark text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Company Info - spans 4 cols on lg */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group cursor-pointer">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-110">
                <HiHome className="w-5 h-5 text-primary-light" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Home<span className="text-primary-light">Nest</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-7 text-gray-400 max-w-sm">
              HomeNest is Bangladesh&apos;s leading property listing platform connecting
              buyers, renters, and agents with verified properties across the country.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - spans 2 cols on lg */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-light transition-all duration-200 hover:pl-1.5 hover:text-white inline-block cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types - spans 3 cols on lg */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Property Types</h4>
            <ul className="space-y-3">
              {propertyTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-light transition-all duration-200 hover:pl-1.5 hover:text-white inline-block cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - spans 3 cols on lg */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <HiMail className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-sm text-gray-400">info@homenest.com.bd</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <HiPhone className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-sm text-gray-400">+880 1234-567890</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <HiLocationMarker className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-sm text-gray-400">
                  House 42, Road 11, Banani<br />Dhaka 1213, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} HomeNest. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-primary-light transition-all duration-200 hover:text-white cursor-pointer">
                Privacy Policy
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/contact" className="hover:text-primary-light transition-all duration-200 hover:text-white cursor-pointer">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}