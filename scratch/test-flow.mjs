
async function runTests() {
  console.log("Starting Deep API Tests...");
  const baseUrl = "http://localhost:3000";
  
  try {
    // 1. Test Hospitals GET
    console.log("1. Fetching Hospitals...");
    const orgsRes = await fetch(`${baseUrl}/api/public/hospitals`);
    if (!orgsRes.ok) throw new Error("Hospitals API failed");
    const orgsData = await orgsRes.json();
    console.log("   - Hospitals found:", orgsData.hospitals?.length);
    const orgId = orgsData.hospitals?.[0]?.id;

    // 2. Fetch Doctors
    console.log("2. Fetching Doctors...");
    const docsRes = await fetch(`${baseUrl}/api/public/hospitals?orgId=${orgId}`);
    if (!docsRes.ok) throw new Error("Doctors API failed");
    const docsData = await docsRes.json();
    console.log("   - Doctors found:", docsData.doctors?.length);
    const doctorId = docsData.doctors?.[0]?.id;

    // 3. Book an Appointment
    console.log("3. Booking Appointment...");
    const bookRes = await fetch(`${baseUrl}/api/public/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        doctorId,
        patientName: "Test Auto Patient",
        patientPhone: "9999999999",
        date: "2026-10-10",
        timeSlot: "10:00 AM"
      })
    });
    if (!bookRes.ok) throw new Error(`Booking API failed: ${bookRes.status}`);
    const bookData = await bookRes.json();
    console.log("   - Appointment Booked:", bookData.tokenNumber);

    // 4. Fetch Doctor Queue
    console.log("4. Fetching Doctor Queue...");
    const queueRes = await fetch(`${baseUrl}/api/appointments`, {
      headers: { "x-org-id": orgId }
    });
    if (!queueRes.ok) throw new Error("Queue API failed");
    const queueData = await queueRes.json();
    console.log("   - Active Queue Length:", queueData.length);
    
    // 5. Test Patient Portal
    console.log("5. Checking Patient Portal...");
    const portalRes = await fetch(`${baseUrl}/api/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientCode: bookData.patientCode })
    });
    if (!portalRes.ok) throw new Error("Patient Portal API failed");
    const portalData = await portalRes.json();
    console.log("   - Portal Data fetched for:", portalData.name);

    console.log("ALL TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("TEST FAILED:", err.message);
  }
}

runTests();

