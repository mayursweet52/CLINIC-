import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, MapPin, Phone, Star, StarHalf, Users, CalendarPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join(".").toUpperCase() + ".";
}

async function getClinicData(slug: string) {
  const clinic = await prisma.organization.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      address: true,
      pincode: true,
      phone: true,
      logoUrl: true,
      coverImageUrl: true,
      rating: true,
      totalReviews: true,
      departments: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { 
          id: true, name: true, slug: true, icon: true,
          _count: { select: { doctors: true } }
        }
      },
      users: {
        where: { role: "DOCTOR", isActive: true },
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              specialization: true,
              consultationFee: true,
              bio: true,
              
            }
          },
          departments: {
            select: { department: { select: { name: true, slug: true, icon: true } } }
          }
        }
      }
    }
  });

  if (!clinic) return null;

  const reviews = await prisma.review.findMany({
    where: { organizationId: clinic.id, isPublic: true },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patient: { select: { name: true } }
    }
  });

  return {
    ...clinic,
    doctors: clinic.users.map(d => ({
      id: d.id,
      name: d.name,
      bio: d.profile?.bio || "",
      yearsOfExperience: 10,
      rating: 4.8, // Static for now
      totalReviews: 12, // Static for now
      specialization: d.profile?.specialization || "Doctor",
      consultationFee: d.profile?.consultationFee || 0,
      departments: d.departments.map(x => x.department)
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      patientInitials: getInitials(r.patient?.name || "Anonymous")
    }))
  };
}

export default async function ClinicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await getClinicData(slug);
  
  if (!clinic) notFound();

  // Generate stars array
  const fullStars = Math.floor(clinic.rating);
  const hasHalfStar = clinic.rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-24 md:pb-0">
      {/* Top Nav */}
      <header className="h-16 bg-surface-lowest/95 backdrop-blur border-b border-outline-variant sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-on-primary" />
            </div>
            <span className="text-lg font-bold text-on-surface hidden sm:block">ClinicOS</span>
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/hospitals">Find Clinics</Link>
            </Button>
            <Button asChild>
              <Link href="/portal/login">Patient Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Clinic Header */}
      <section className="bg-surface-low border-b border-outline-variant">
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary to-primary-container relative">
          {clinic.coverImageUrl && (
            <img src={clinic.coverImageUrl} alt={clinic.name} className="w-full h-full object-cover opacity-80" />
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 -mt-12 md:-mt-16 relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-surface-low bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-3xl overflow-hidden shadow-sm shrink-0">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(clinic.name).substring(0, 2)
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface">{clinic.name}</h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-on-surface-variant font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.address}, {clinic.city}</span>
                </div>
                {clinic.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-secondary">
                  <div className="flex">
                    {[...Array(fullStars)].map((_, i) => <Star key={`f-${i}`} className="w-4 h-4 fill-current" />)}
                    {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
                    {[...Array(emptyStars)].map((_, i) => <Star key={`e-${i}`} className="w-4 h-4 text-outline" />)}
                  </div>
                  <span className="font-semibold">{clinic.rating.toFixed(1)}</span>
                  <span className="text-on-surface-variant font-normal">({clinic.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <Button size="lg" className="flex-1 md:w-48 gap-2">
                <CalendarPlus className="w-4 h-4" />
                Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="flex-1 md:w-48">
                Call Clinic
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 w-full">
        
        {/* Departments */}
        <section>
          <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            Our Specialties <span className="text-sm font-medium bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full">{clinic.departments.length}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clinic.departments.map(dept => (
              <div key={dept.id} className="bg-surface-lowest p-5 rounded-2xl border border-outline-variant hover:border-primary/50 hover:shadow-sm transition-all text-center group cursor-default">
                <div className="w-12 h-12 mx-auto bg-surface-low rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {dept.icon || "🏥"}
                </div>
                <h3 className="font-semibold text-on-surface mt-3">{dept.name}</h3>
                <p className="text-xs text-on-surface-variant mt-1">{dept._count.doctors} doctors</p>
              </div>
            ))}
          </div>
        </section>

        {/* Doctors */}
        <section>
          <h2 className="text-2xl font-bold text-on-surface mb-6">Our Doctors</h2>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            <Button variant="default" size="sm" className="rounded-full shrink-0">All Doctors</Button>
            {clinic.departments.map(d => (
              <Button key={d.id} variant="outline" size="sm" className="rounded-full shrink-0 bg-surface-lowest">
                {d.name}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.doctors.map(doc => (
              <div key={doc.id} className="bg-surface-lowest rounded-2xl p-5 border border-outline-variant shadow-sm flex flex-col h-full">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shrink-0">
                    {getInitials(doc.name).substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface leading-tight">{doc.name}</h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-0.5">{doc.specialization}</p>
                    <div className="inline-block px-2 py-0.5 bg-surface-low text-xs font-medium text-on-surface-variant rounded mt-2">
                      {doc.yearsOfExperience} years exp
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-outline-variant/50 flex flex-wrap gap-1.5">
                  {doc.departments.map(d => (
                    <span key={d.slug} className="text-xs bg-surface-low px-2 py-1 rounded text-on-surface-variant">
                      {d.icon} {d.name}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-on-surface-variant">Consultation Fee</p>
                    <p className="font-bold text-on-surface">₹{doc.consultationFee}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/book?doctor=${doc.id}`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            Patient Reviews <span className="text-lg font-medium text-secondary">★ {clinic.rating.toFixed(1)}</span>
          </h2>
          
          {clinic.reviews.length === 0 ? (
            <div className="bg-surface-lowest p-8 rounded-2xl border border-outline-variant text-center">
              <Star className="w-10 h-10 text-outline mx-auto mb-3" />
              <p className="text-on-surface font-medium">No reviews yet</p>
              <p className="text-sm text-on-surface-variant mt-1">Be the first to review this clinic after your visit.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinic.reviews.map(review => (
                <div key={review.id} className="bg-surface-lowest p-5 rounded-2xl border border-outline-variant">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-low text-on-surface-variant flex items-center justify-center font-bold text-sm">
                      {review.patientInitials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Verified Patient</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-secondary">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-outline"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface italic text-on-surface-variant">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-lowest/95 backdrop-blur border-t border-outline-variant z-50 flex gap-3">
        <Button className="flex-1 gap-2">
          <CalendarPlus className="w-4 h-4" />
          Book
        </Button>
        <Button variant="outline" className="flex-1">Call</Button>
      </div>
    </div>
  );
}
