"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success(`Registered! Your ID: ${result.patientCode}`);
      setTimeout(() => router.push("/portal/login"), 1500);
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-md rounded-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Registration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create your account to access your health records
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Rajesh Kumar"
              required
              minLength={2}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="9876543210"
              required
              minLength={10}
            />
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password * (min 6 characters)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already registered?{" "}
          <Link href="/portal/login" className="text-primary-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
