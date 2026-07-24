# HomeNest - Modern Real Estate & Property Platform

A feature-rich real estate web application for browsing property listings, scheduling visits, negotiating deal offers, managing multi-role dashboards, and processing online payments. Built with Next.js 16, React 19, Tailwind CSS 4, Stripe, Zustand, and Framer Motion.

## Overview

HomeNest is a full-featured real estate platform connecting home buyers, property sellers, real estate agents, and site administrators. Users can search and filter properties by city, type, price, and amenities, schedule property visits, submit purchase offers, negotiate deal terms, and make secure earnest money deposits via Stripe. The platform features multi-role dashboards tailored for Buyers, Sellers/Agents, and Administrators with interactive analytics powered by Recharts.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Form Validation | React Hook Form, Zod, @hookform/resolvers |
| Payments | Stripe JS (@stripe/stripe-js) |
| Data Visualization | Recharts |
| Animations | Framer Motion |
| HTTP Client | Axios |
| UI Components | React Icons, React Loading Skeleton, React Toastify |

## Core Features

- **Property Discovery & Search** — Advanced filtering by property type (apartment, villa, commercial, land), location, price range, bedrooms, ratings, and keyword search
- **Property Listing Management** — Create, edit, and publish listings with multiple images, detailed descriptions, pricing options, and amenity tags
- **Deal & Offer Negotiation** — Submit purchase offers, negotiate price with counter-offers/acceptance, track deal history, and execute property transactions
- **Stripe Payments Integration** — Secure earnest money deposits and payment processing powered by Stripe
- **Property Visit Scheduling** — Schedule in-person property viewings with preferred date/time slots and status updates
- **Inquiry & Direct Messaging** — Send property inquiries to agents with threaded reply histories
- **Multi-Role Dashboards** —
  - **Buyer Dashboard**: Track favorite properties, submitted offers, scheduled visits, and payment history
  - **Seller / Agent Dashboard**: Manage active listings, handle inquiry responses, evaluate visit requests, and negotiate offers
  - **Admin Dashboard**: System-wide platform stats, property listing review & approvals, user/agent access control, and analytics charts powered by Recharts
- **Authentication & Security** — JWT session authorization with local state persistence and Google OAuth sign-in integration
- **Polished UX** — Smooth Framer Motion transitions, responsive Tailwind CSS 4 layout, custom loading skeletons, and toast alerts

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.10 | Core React framework (App Router) |
| `react` | 19.2.4 | UI component library |
| `react-dom` | 19.2.4 | React DOM rendering engine |
| `zustand` | ^5.0.14 | Lightweight global state management |
| `@stripe/stripe-js` | ^9.10.0 | Stripe payment gateway SDK |
| `framer-motion` | ^12.42.2 | Page transitions and UI micro-interactions |
| `react-hook-form` | ^7.81.0 | Form state management |
| `@hookform/resolvers` | ^5.4.0 | Validation schema adapter for React Hook Form |
| `zod` | ^4.4.3 | Type-safe schema validation |
| `axios` | ^1.18.1 | Promise-based HTTP client for API requests |
| `recharts` | ^3.9.2 | Dynamic analytics and dashboard chart visualizations |
| `react-icons` | ^5.7.0 | Icon library |
| `react-loading-skeleton` | ^3.5.0 | Skeleton screen placeholder loading states |
| `react-toastify` | ^11.1.0 | Real-time toast notifications |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind CSS v4 |
| `typescript` | ^5 | Static type checking and IntelliSense |
| `eslint` | ^9 | JavaScript/TypeScript code linter |
| `eslint-config-next` | 16.2.10 | Next.js ESLint configuration |
| `@types/node` | ^20 | Node.js TypeScript type definitions |
| `@types/react` | ^19 | React TypeScript type definitions |
| `@types/react-dom` | ^19 | React DOM TypeScript type definitions |

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API server running (e.g. `homenest-server`)
- Stripe account keys for online payments
- npm / yarn / pnpm / bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/abrar12678/homenest-client.git
cd homenest-client

# 2. Install dependencies
npm install

# 3. Create a .env.local file and configure your environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Run Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Build for Production

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## Live Demo

Try HomeNest live: [homenest-client.vercel.app](https://homenest-client.vercel.app)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
