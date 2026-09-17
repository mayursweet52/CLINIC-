import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <main className="text-center w-full max-w-4xl px-6">
        <h1 className="text-5xl font-bold tracking-tight text-slate-800 mb-6">
          Clinic Management System
        </h1>
        <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
          Welcome to the clinic portal. Please select whether you are a patient looking for care, or a staff member managing the clinic.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <Link
            href="/patient/login"
            className="flex-1 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
              P
            </div>
            <h5 className="mb-2 text-2xl font-semibold text-slate-800">
              Patient Portal
            </h5>
            <p className="text-slate-500 leading-relaxed mb-6">
              Book appointments, check your live tokens, and view digital prescriptions.
            </p>
            <span className="mt-auto inline-block bg-blue-600 text-white font-medium px-6 py-2 rounded-lg w-full">
              Enter as Patient
            </span>
          </Link>

          <Link
            href="/staff/login"
            className="flex-1 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:indigo-400 transition-all duration-200 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
              S
            </div>
            <h5 className="mb-2 text-2xl font-semibold text-slate-800">
              Staff Portal
            </h5>
            <p className="text-slate-500 leading-relaxed mb-6">
              Manage patient records, receptionist queues, billing, and administration.
            </p>
            <span className="mt-auto inline-block bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg w-full">
              Enter as Staff
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
