'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Receipt, Pill, LogOut, ArrowRight, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import PayButton from '@/components/portal/PayButton';

export default function PortalDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/me')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setData)
      .catch(() => {
        router.push('/portal/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    // Basic way to clear cookie client-side
    document.cookie = 'patient_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    toast.success('Logged out successfully');
    router.push('/portal/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {data.patient.name}</h1>
          <p className="text-muted-foreground mt-1">Manage your appointments and medical records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/book">
              <Calendar className="mr-2 h-4 w-4" /> Book Appointment
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointments */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.appointments?.length > 0 ? (
              <div className="space-y-4">
                {data.appointments.slice(0, 3).map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-full hidden sm:block">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{apt.doctor}</h4>
                        <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                          <span>{new Date(apt.date).toLocaleDateString()} at {apt.time}</span>
                          <span className="font-medium text-primary">Token #{apt.token}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
                {data.appointments.length > 3 && (
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    View all appointments <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                <Calendar className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No appointments found.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/book">Book your first appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Bills */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.bills?.length > 0 ? (
                <div className="space-y-3">
                  {data.bills.slice(0, 3).map((bill: any) => (
                    <div key={bill.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted">
                      <div>
                        <p className="font-medium">{bill.invoiceNo || 'Invoice'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(bill.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-bold">₹{bill.amount}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          bill.status === 'PAID' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {bill.status}
                        </span>
                        {bill.status !== 'PAID' && (
                          <PayButton billId={bill.id} amount={bill.amount} />
                        )}
                        {bill.status === 'PAID' && (
                          <Button variant="outline" size="sm" className="mt-1 text-[10px] h-6 px-2" asChild>
                            <a href={`/api/portal/invoices/${bill.id}`} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent bills</p>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions (Placeholder) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-primary" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">No active prescriptions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
