import PDFDocument from "pdfkit";

export async function generatePrescriptionPDF(
  prescription: any,
  patient: any,
  doctor: any,
  organization: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Use default Helvetica since NotoSans might not be available
      doc.font("Helvetica");

      // HEADER
      doc.fontSize(20).font("Helvetica-Bold").text(organization.name, { align: "left" });
      doc.fontSize(10).font("Helvetica").fillColor("gray")
         .text(organization.address || "")
         .text(`Ph: ${organization.phone || ""}`);
      
      doc.moveUp(3);
      doc.fontSize(24).fillColor("#0066FF").font("Helvetica-Bold")
         .text("PRESCRIPTION", { align: "right" });
      doc.fontSize(10).fillColor("gray").font("Helvetica")
         .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, { align: "right" });
      
      doc.moveDown();
      doc.strokeColor("#eeeeee").lineWidth(1)
         .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // PATIENT DETAILS
      const yPatient = doc.y;
      doc.fontSize(10).fillColor("gray").text("Patient:");
      doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text(patient.name);
      doc.fontSize(10).font("Helvetica")
         .text(`${patient.gender} | ${patient.bloodGroup || "O+"}`)
         .text(`Ph: ${patient.phone}`);

      // DOCTOR DETAILS
      doc.y = yPatient;
      doc.fontSize(10).fillColor("gray").text("Prescribed by:", { align: "right" });
      doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text(doctor.name, { align: "right" });
      doc.fontSize(10).font("Helvetica")
         .text(`${doctor.doctorProfile?.specialization || "General Physician"}`, { align: "right" })
         .text(`Reg: ${doctor.doctorProfile?.licenseNumber || "N/A"}`, { align: "right" });

      doc.moveDown(2);

      // DIAGNOSIS
      if (prescription.visit?.diagnosis) {
        doc.fontSize(10).fillColor("gray").text("Diagnosis:");
        doc.fontSize(12).fillColor("black").text(prescription.visit.diagnosis);
        doc.moveDown(2);
      }

      // MEDICINES TABLE
      doc.fontSize(14).font("Helvetica-Bold").text("Medicines", { underline: true });
      doc.moveDown();

      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold").fillColor("gray");
      doc.text("#", 50, tableTop);
      doc.text("Medicine", 80, tableTop);
      doc.text("Dosage", 250, tableTop);
      doc.text("Frequency", 350, tableTop);
      doc.text("Duration", 450, tableTop);
      
      doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke();
      
      doc.font("Helvetica").fillColor("black");
      let y = doc.y + 15;
      
      prescription.items = prescription.items || [];
      if (typeof prescription.items === "string") {
        try {
          prescription.items = JSON.parse(prescription.items);
        } catch(e) {}
      }

      prescription.items.forEach((item: any, i: number) => {
        doc.text((i + 1).toString(), 50, y);
        doc.text(item.name || item.medicineName || "Unknown", 80, y, { width: 160 });
        doc.text(item.dosage || "-", 250, y, { width: 90 });
        doc.text(item.frequency || "-", 350, y, { width: 90 });
        doc.text(item.duration || "-", 450, y, { width: 80 });
        
        y += 20;
      });

      doc.y = y + 20;

      // INSTRUCTIONS
      if (prescription.notes) {
        doc.moveDown();
        doc.fontSize(10).fillColor("gray").font("Helvetica-Bold").text("Instructions:");
        doc.fontSize(10).fillColor("black").font("Helvetica").text(prescription.notes);
      }

      // FOOTER
      const bottom = 700;
      doc.moveTo(50, bottom).lineTo(545, bottom).stroke();
      
      doc.fontSize(10).fillColor("black").font("Helvetica-Bold")
         .text("Doctor's Signature", 400, bottom + 15, { align: "right" });
      doc.fontSize(10).font("Helvetica")
         .text(doctor.name, 400, bottom + 30, { align: "right" })
         .text(`Reg: ${doctor.doctorProfile?.licenseNumber || "N/A"}`, 400, bottom + 45, { align: "right" });
      
      doc.fontSize(8).fillColor("gray")
         .text("Generated securely by ClinicOS", 50, bottom + 30, { align: "left" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
