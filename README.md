# ClinicOS

> Enterprise-grade OPD Clinic Management System

[![Build Status](https://github.com/clinic/clinicos/actions/workflows/ci.yml/badge.svg)](https://github.com/clinic/clinicos/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![ClinicOS Dashboard](./ui-audit/demo/scene1-doctor.png)

## Features

- **OPD clinic management**: End-to-end patient lifecycle from booking to pharmacy
- **Real-time updates**: Powered by Redis + SSE for instant dashboard updates
- **Multi-role RBAC**: Doctor, Reception, Pharmacy, Admin portals
- **Payments**: Integrated Razorpay for seamless billing
- **Notifications**: Automated Email/SMS/WhatsApp via BullMQ background workers
- **Patient portal**: Secure login via OTP for patients to view records
- **Analytics**: Beautiful charts using Recharts for clinic performance
- **Doctor schedule**: Calendar and timeline views
- **Audit logs**: Comprehensive tracking of all actions

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui
- **State Management:** TanStack Query + Zustand
- **Backend:** Next.js App Router API, Prisma, PostgreSQL
- **Real-time & Queues:** Redis + BullMQ
- **Animations & Visuals:** framer-motion, Recharts
- **Testing:** Playwright (E2E), Vitest (Unit)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/clinic/clinicos.git
   cd clinicos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Update .env with your credentials
   ```

4. **Database setup:**
   ```bash
   npx prisma migrate dev
   node prisma/seed.mjs
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run worker:notifications` | Start BullMQ worker for notifications |
| `npm run demo:record` | Run Playwright script to record demo screenshots |

## Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string (e.g. Neon)
- `REDIS_URL`: Redis connection string (e.g. Upstash)
- `JWT_SECRET`: Secret key for authentication

**Optional:**
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: For payments
- `RESEND_API_KEY`: For emails
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: For SMS
- `SENTRY_DSN`: For error tracking

## Deployment

### Vercel Deployment

1. Fork or clone the repository to your GitHub account.
2. Create a new project in Vercel and import the repository.
3. Configure the following environment variables in Vercel Settings:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
4. Set the Build Command to `npx prisma generate && next build`.
5. Deploy!

*Note: For the database, we recommend [Neon (Serverless Postgres)](https://neon.tech), and for Redis we recommend [Upstash](https://upstash.com).*

## Architecture

```
+----------------+      +-------------------+
|  Client (Web)  | ---> |   Next.js API     |
+----------------+      +-------------------+
        |                         |
        | (SSE)                   v
        |               +-------------------+
+----------------+      |     Services      |
|  Patient App   |      +-------------------+
+----------------+          |           |
                            v           v
                    +------------+  +-------+
                    | PostgreSQL |  | Redis |
                    +------------+  +-------+
                                        |
                                        | (BullMQ Event Bus)
                                        v
                                +----------------+
                                | Worker Process |
                                +----------------+
                                        |
                            +-----------+-----------+
                            |           |           |
                            v           v           v
                        +-------+   +-------+   +-------+
                        | Email |   |  SMS  |   | Pay   |
                        +-------+   +-------+   +-------+
```

## Screenshots

### Dashboard
![Dashboard](./ui-audit/demo/scene1-doctor.png)

### Booking Flow
![Booking](./ui-audit/demo/scene2-booking-step1.png)

## Multi-Tenant Onboarding

### Add New Clinic

```bash
node scripts/add-clinic.cjs "Clinic Name" "owner@email.com" "Password@123" "+91 phone"
```

This creates:
- Organization (isolated data)
- Owner admin account
- RBAC permissions

### Verify Isolation

Each clinic's data is fully isolated. Test:
1. Login as Clinic A admin → see only Clinic A data
2. Login as Clinic B admin → see only Clinic B data
