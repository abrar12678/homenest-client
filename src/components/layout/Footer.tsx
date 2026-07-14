import Link from 'next/link';
import {
  HiHome,
  HiMail,
  HiPhone,
  HiLocationMarker,
} from 'react-icons/hi';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from 'react-icons/fa';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Explore' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
];

const propertyTypes = [
  { href: '/properties?type=apartment', label: 'Apartment' },
  { href: '/properties?type=villa', label: 'Villa' },
  { href: '/properties?type=commercial', label: 'Commercial' },
  { href: '/properties?type=land', label: 'Land' },
];

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <HiHome className="w-7 h-7 text-primary-light" />
              <span className="text-xl font-bold text-white">
                Home<span className="text-primary-light">Nest</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              HomeNest is Bangladesh&apos;s leading property listing platform connecting
              buyers, renters, and agents with verified properties across the country.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary-light transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Property Types</h4>
            <ul className="space-y-3">
              {propertyTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiMail className="w-5 h-5 text-primary-light mt-0.5 shrink-0" />
                <span className="text-sm">info@homenest.com.bd</span>
              </li>
              <li className="flex items-start gap-3">
                <HiPhone className="w-5 h-5 text-primary-light mt-0.5 shrink-0" />
                <span className="text-sm">+880 1234-567890</span>
              </li>
              <li className="flex items-start gap-3">
                <HiLocationMarker className="w-5 h-5 text-primary-light mt-0.5 shrink-0" />
                <span className="text-sm">
                  House 42, Road 11, Banani<br />Dhaka 1213, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-sm text-gray-400">
            &copy; 2026 HomeNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}