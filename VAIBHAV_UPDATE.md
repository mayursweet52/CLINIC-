# Update for Vaibhav (Database Developer)

**Hi Vaibhav,**

Frontend aur UI Dashboard ka kaam `Next.js` me almost complete ho chuka hai. Humne backend logic ke liye Next.js API Routes (`/api/appointments`, `/api/patients`, `/api/pharmacy`, `/api/finance`) bana liye hain, lekin abhi unme temporary/mock data use ho raha hai. 

Tumhe backend aur Database ka setup karna hai. Yaha list hai ki tumhe kya complete karna hai:

### 1. Database Setup & ORM
* Project me **PostgreSQL** database use hoga (jo `docker-compose.yml` me pehle se configured hai).
* Tumhe **Prisma ORM** (`@prisma/client`) install karke `schema.prisma` file banani hai.

### 2. Required Database Tables (Schema)
Tumhe Prisma me ye main models define karne hain:
1. **Users:** For Role-based Auth (Admin, Doctor, Receptionist).
2. **Patients:** For patient records (Code, Name, Vitals, History).
3. **Appointments:** For tracking Queue & Live Tokens (Patient ID, Status: Arrived/Completed).
4. **Vitals & Consultations:** BP, Pulse, Weight, aur Doctor's notes.
5. **Medicines / Inventory:** For the Pharmacy tab (Stock quantity, Price).
6. **Billing:** Invoice generation.
7. **Transactions (Finance):** Income aur Expenses log karne ke liye.

### 3. API Integration & Authentication
* Jab tumhara Prisma schema ready ho jaye, toh batana taaki hum `/api/...` routes me array push karne ki jagah `prisma.patient.create()` jaisi actual queries replace kar sakein.
* NextAuth.js ka setup karke Role-Based Login connect karna hai.

**Next Step for you:** Prisma initialize karo, schema likho, aur migrations run karke database tables ready karo. Jab tables ban jayein, toh is repo me push kar dena!
