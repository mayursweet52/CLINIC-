'use client';
import { useState, useEffect } from 'react';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    age: '',
    gender: 'Male',
    doctorId: '',
  });

  // Load active queue
  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  // Load doctors for assignment
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        const docs = data.filter((s: any) => s.role === 'DOCTOR' || s.role === 'Doctor');
        setDoctors(docs.length > 0 ? docs : data);
        if (docs.length > 0) {
          setFormData((prev) => ({ ...prev, doctorId: docs[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const updateStatus = async (id: string | number, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    try {
      await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Naya Patient Create Karein
      const patientRes = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contactNumber: formData.contactNumber,
          age: parseInt(formData.age) || 30,
          gender: formData.gender,
        }),
      });

      const newPatient = await patientRes.json();
      const patientId = newPatient.id || newPatient.patient?.id || newPatient.patientCode;

      // Step 2: Patient ko Queue me lagayein (Appointment Book karein)
      if (patientId) {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patientId,
            doctorId: formData.doctorId || (doctors[0]?.id ?? null),
            appointmentDate: new Date().toISOString(),
            timeSlot: 'Walk-in',
            status: 'Arrived',
          }),
        });

        // Step 3: Modal close karein aur list refresh karein
        setIsModalOpen(false);
        setFormData({
          name: '',
          contactNumber: '',
          age: '',
          gender: 'Male',
          doctorId: doctors[0]?.id || '',
        });
        await fetchAppointments();
      }
    } catch (error) {
      console.error('Error registering walk-in:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Receptionist Desk</h2>
          <p className="text-slate-500">Manage waiting room queues, walk-in admissions, and live patient flow.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Register Walk-in
        </button>
      </div>

      {/* Live Queue Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

        <div className="p-0 relative z-10">
          <div className="px-6 py-4 bg-[#fafafa] border-b border-slate-100 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">Today&apos;s Live Queue</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {appointments.length} Patients
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="p-6">Token</th>
                <th className="p-6">Patient Name</th>
                <th className="p-6">Doctor</th>
                <th className="p-6">Time Slot</th>
                <th className="p-6 text-right">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                    The waiting room is empty. Click &apos;+ Register Walk-in&apos; to add a patient.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="p-6 font-bold text-blue-600">
                      #{appt.tokenNumber || appt.token || 'N/A'}
                    </td>
                    <td className="p-6 font-bold text-slate-900 text-lg">
                      {appt.patientName || appt.patient?.name || 'Unknown Patient'}
                    </td>
                    <td className="p-6 text-slate-600 font-medium">
                      {appt.doctor?.name || appt.doctor || 'Unassigned'}
                    </td>
                    <td className="p-6 text-slate-600 font-medium">
                      {appt.timeSlot || appt.time || 'Walk-in'}
                    </td>
                    <td className="p-6 text-right">
                      <select
                        value={appt.status}
                        onChange={(e) => updateStatus(appt.id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 outline-none cursor-pointer transition-all shadow-sm focus:ring-4
                          ${
                            appt.status === 'Arrived'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-100'
                              : appt.status === 'In Consultation'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-100'
                              : appt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-100'
                          }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Arrived">Arrived</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-in Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Register Walk-in Patient</h3>
                <p className="text-sm text-slate-500">Add a walk-in patient directly to the waiting room queue.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="32"
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>

              {doctors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Doctor</label>
                  <select
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.department || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Registering...' : 'Register & Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
