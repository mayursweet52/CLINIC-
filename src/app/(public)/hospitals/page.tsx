"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartPulse } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

type Clinic = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  rating: number;
  totalReviews: number;
  doctorsCount: number;
  patientCount: number;
  logoUrl: string | null;
  coverImageUrl: string | null;
  departments: Array<{ name: string; slug: string; icon: string | null }>;
};

export default function HospitalsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClinics();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, city, department, sortBy]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (city) query.set("city", city);
      if (department) query.set("department", department);
      if (sortBy) query.set("sortBy", sortBy);
      
      const res = await fetch(`/api/public/clinics?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClinics(data.clinics);
      }
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <header className="h-16 bg-surface-lowest/95 backdrop-blur border-b border-outline-variant sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-on-primary" />
            </div>
            <span className="text-lg font-bold text-on-surface">ClinicOS</span>
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/portal/login">Staff Login</Link>
            </Button>
            <Button asChild>
              <Link href="/portal/login">Patient Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-b from-surface-low to-surface px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-sm font-medium">
            🏥 Find Care
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface">Find a clinic near you</h1>
          <p className="text-lg text-on-surface-variant">Browse verified clinics, choose your doctor, book instantly</p>
          
          <div className="relative max-w-xl mx-auto mt-8 flex shadow-sm rounded-xl overflow-hidden bg-surface-lowest border border-outline-variant focus-within:ring-2 ring-primary transition-all">
            <div className="pl-4 flex items-center justify-center">
              <Search className="w-5 h-5 text-on-surface-variant" />
            </div>
            <input 
              type="text" 
              className="w-full bg-transparent border-0 focus:ring-0 px-3 py-4 text-on-surface placeholder:text-on-surface-variant/70"
              placeholder="Search by clinic name, city, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              className="px-4 py-4 bg-surface-low text-primary text-sm font-medium hover:bg-surface-variant transition-colors border-l border-outline-variant"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(() => {
                    // Placeholder for actual geocoding
                    setCity("Noida"); 
                  });
                }
              }}
            >
              Use my location
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button onClick={() => { setCity(""); setDepartment(""); setSortBy("rating"); }} className="px-3 py-1.5 rounded-full bg-surface-lowest border border-outline-variant text-sm font-medium hover:bg-surface-low">All Clinics</button>
            <button onClick={() => setDepartment("cardiology")} className="px-3 py-1.5 rounded-full bg-surface-lowest border border-outline-variant text-sm font-medium hover:bg-surface-low">Cardiology</button>
            <button onClick={() => setDepartment("orthopedics")} className="px-3 py-1.5 rounded-full bg-surface-lowest border border-outline-variant text-sm font-medium hover:bg-surface-low">Orthopedics</button>
            <button onClick={() => setSortBy("rating")} className="px-3 py-1.5 rounded-full bg-surface-lowest border border-outline-variant text-sm font-medium hover:bg-surface-low">Top Rated</button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">{clinics.length} clinics found</h2>
            {(city || department) && (
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
                Filters Active
              </span>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <select 
              value={city} 
              onChange={e => setCity(e.target.value)}
              className="bg-surface-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
            >
              <option value="">All Cities</option>
              <option value="Noida">Noida</option>
              <option value="Delhi">Delhi</option>
              <option value="Gurugram">Gurugram</option>
            </select>
            <select 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
              className="bg-surface-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
            >
              <option value="">All Specialties</option>
              <option value="general-medicine">General Medicine</option>
              <option value="cardiology">Cardiology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-surface-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-surface-low animate-pulse" />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No clinics found"
            description="Try adjusting your filters or searching for a different location."
            action={<Button onClick={() => { setSearch(""); setCity(""); setDepartment(""); }}>Clear filters</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map(clinic => (
              <Link key={clinic.id} href={`/hospitals/${clinic.slug}`} className="group block h-full">
                <div className="bg-surface-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant group-hover:shadow-md group-hover:border-primary/50 transition-all h-full flex flex-col">
                  
                  {/* Cover Image */}
                  <div className="h-32 bg-gradient-to-br from-primary to-primary-container relative">
                    {clinic.coverImageUrl && (
                      <img src={clinic.coverImageUrl} alt={clinic.name} className="w-full h-full object-cover opacity-80" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 pt-0 flex-1 flex flex-col">
                    {/* Logo Circle */}
                    <div className="w-16 h-16 rounded-full -mt-8 border-4 border-surface-lowest bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl overflow-hidden relative z-10">
                      {clinic.logoUrl ? (
                        <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(clinic.name)
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-on-surface mt-3 group-hover:text-primary transition-colors">{clinic.name}</h3>
                    
                    <div className="flex items-center text-sm text-on-surface-variant mt-1 gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{clinic.city}{clinic.state ? `, ${clinic.state}` : ''}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center text-secondary">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="font-semibold text-on-surface">{clinic.rating.toFixed(1)}</span>
                      <span className="text-xs text-on-surface-variant">({clinic.totalReviews} reviews)</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {clinic.departments.slice(0, 3).map(dept => (
                        <span key={dept.slug} className="px-2 py-1 rounded-full bg-surface-low text-xs font-medium text-on-surface-variant flex items-center gap-1">
                          {dept.icon && <span>{dept.icon}</span>}
                          {dept.name}
                        </span>
                      ))}
                      {clinic.departments.length > 3 && (
                        <span className="px-2 py-1 rounded-full bg-surface-variant text-xs font-medium text-on-surface-variant">
                          +{clinic.departments.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-outline-variant/50 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="font-medium text-on-surface">{clinic.doctorsCount}</span> Doctors
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-secondary" />
                          <span className="font-medium text-on-surface">{clinic.patientCount}+</span> Patients
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4 group-hover:bg-primary-600">
                        View & Book
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
