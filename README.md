# ClinicOS 🏥

A modern, multi-tenant Clinic and Hospital Management System built with Next.js, Prisma, and PostgreSQL.

## 🌟 Overview & Features

ClinicOS streamlines hospital operations with a fully integrated suite of tools:

- **Public Booking Portal:** Patients can seamlessly book appointments with specific doctors across different hospital branches.
- **Doctor Dashboard:** Live patient queue, vitals entry, clinical notes, and automated consultation completions.
- **Receptionist & Billing:** Dedicated portal for front-desk staff to generate bills and collect payments for completed consultations.
- **Patient Portal:** Secure access for patients to view their medical history, prescriptions, and lab reports.
- **Multi-Tenant Architecture:** Built securely to support multiple hospital organizations on a single platform using role-based access control (RBAC).

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher) or [Docker](https://www.docker.com/) for running a containerized database.

## 🚀 Environment Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and update the `DATABASE_URL` with your local PostgreSQL credentials.

## 💾 Database Migrations & Seeding

This project uses Prisma ORM.

1. **Run Migrations:**
   Apply the database schema to your local PostgreSQL instance:
   ```bash
   npx prisma migrate dev
   ```

2. **Seed Demo Data:**
   Populate your database with mock organizations, users (doctors, admins, receptionists), and patients:
   ```bash
   npm run prisma:seed
   ```

## 🧪 Testing

We use Vitest for unit testing and Playwright for End-to-End (E2E) testing.

- **Run Unit Tests:**
  ```bash
  npm run test:unit
  ```
- **Run E2E Tests:**
  ```bash
  npx playwright test
  ```

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Add `DATABASE_URL` and `JWT_SECRET` to the Vercel Environment Variables.
4. Deploy! Vercel automatically detects Next.js and runs the build command.

### Docker / VPS
1. Build the Next.js standalone application:
   ```bash
   npm run build
   ```
2. Run the Node server from `.next/standalone/server.js` or write a standard `Dockerfile` exposing port `3000`.

## 🌐 Local Tunneling (Optional)
Do not commit local tunneling binaries like `cloudflared.exe`. If you need to expose your local dev server to the internet:
1. Download `cloudflared` from the [official Cloudflare repository](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Run: `cloudflared tunnel --url http://localhost:3000`
