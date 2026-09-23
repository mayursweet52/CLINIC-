# Client Onboarding Guide

## For Developer (You)

When a new clinic signs up:

1. Run onboarding script:
   ```bash
   node scripts/add-clinic.cjs "Clinic Name" "owner@email.com" "Password@123" "+91 phone"
   ```

2. Share credentials with client:
   - Login URL: https://app.clinicos.com/login
   - Email + Password

3. Client logs in → Dashboard (empty)

4. Client adds:
   - Doctors (Staff → Add Staff)
   - Doctor availability (Doctor schedule)
   - Medicines (Pharmacy → Inventory)

5. Client starts using system.

## For Client

### Step 1: Login
Visit `/login` with provided credentials.

### Step 2: Add Your Doctors
Go to Admin → Staff → Add Staff
- Name, email, phone
- Role: Doctor
- They get login credentials

### Step 3: Set Doctor Schedules
Each doctor logs in → /doctor/schedule
- Add weekly availability (Mon-Fri 10am-2pm)
- Mark leaves

### Step 4: Add Inventory
Pharmacy → Inventory → Add medicine
- Name, batch, quantity, price, expiry

### Step 5: Start Booking
Share public URL: `yourclinic.clinicos.com/book`
Patients can book appointments.

## Support
- Email: support@clinicos.com
- WhatsApp: +91 xxx
