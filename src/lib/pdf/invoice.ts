import PDFDocument from "pdfkit";

export async function generateInvoicePDF(
  bill: any,
  patient: any,
  organization: any,
  appointment: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      doc.font("Helvetica");

      // HEADER
      doc.fontSize(20).font("Helvetica-Bold").text(organization.name, { align: "left" });
      doc.fontSize(10).font("Helvetica").fillColor("gray")
         .text(organization.address || "")
         .text(`Ph: ${organization.phone || ""}`);
      
      doc.moveUp(3);
      doc.fontSize(24).fillColor("#0066FF").font("Helvetica-Bold")
         .text("TAX INVOICE", { align: "right" });
      doc.fontSize(10).fillColor("gray").font("Helvetica")
         .text(`Invoice #: ${bill.invoiceNo}`, { align: "right" })
         .text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, { align: "right" });
      
      doc.moveDown();
      doc.strokeColor("#eeeeee").lineWidth(1)
         .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // PATIENT DETAILS
      doc.fontSize(10).fillColor("gray").text("Billed To:");
      doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text(patient.name || patient.firstName);
      doc.fontSize(10).font("Helvetica")
         .text(`Patient ID: ${patient.patientCode || "-"}`)
         .text(`Ph: ${patient.phone}`);

      doc.moveDown(2);

      // LINE ITEMS TABLE
      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold").fillColor("gray");
      doc.text("Description", 50, tableTop);
      doc.text("Qty", 350, tableTop);
      doc.text("Rate", 420, tableTop);
      doc.text("Amount", 480, tableTop, { align: "right", width: 65 });
      
      doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke();
      
      doc.font("Helvetica").fillColor("black");
      let y = doc.y + 15;
      
      // Consultation
      if (bill.consultationFee > 0) {
        doc.text("Doctor Consultation Fee", 50, y);
        doc.text("1", 350, y);
        doc.text(bill.consultationFee.toString(), 420, y);
        doc.text(bill.consultationFee.toString(), 480, y, { align: "right", width: 65 });
        y += 20;
      }

      // Medicines
      if (bill.medicineCharges > 0) {
        doc.text("Pharmacy Medicines", 50, y);
        doc.text("1", 350, y);
        doc.text(bill.medicineCharges.toString(), 420, y);
        doc.text(bill.medicineCharges.toString(), 480, y, { align: "right", width: 65 });
        y += 20;
      }

      doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
      y += 20;

      // TOTALS
      doc.fontSize(10).font("Helvetica-Bold");
      
      if (bill.discount > 0) {
        doc.text("Subtotal", 350, y);
        doc.text((bill.totalAmount + bill.discount).toString(), 480, y, { align: "right", width: 65 });
        y += 15;
        doc.text("Discount", 350, y);
        doc.text(`-${bill.discount}`, 480, y, { align: "right", width: 65 });
        y += 15;
      }

      doc.fontSize(14);
      doc.text("TOTAL", 350, y);
      doc.text(`Rs. ${bill.totalAmount}`, 450, y, { align: "right", width: 95 });

      // STATUS STAMP
      doc.moveDown(4);
      if (bill.paymentStatus === "PAID") {
        doc.fontSize(16).fillColor("#10b981").font("Helvetica-Bold").text("PAID", 50, doc.y);
        doc.fontSize(10).fillColor("gray").font("Helvetica")
           .text(`Method: ${bill.paymentMethod || "Online"}`, 50, doc.y)
           .text(`Txn ID: ${bill.razorpayPaymentId || "-"}`, 50, doc.y);
      } else {
        doc.fontSize(16).fillColor("#ef4444").font("Helvetica-Bold").text("PENDING", 50, doc.y);
      }

      // FOOTER
      const bottom = 700;
      doc.moveTo(50, bottom).lineTo(545, bottom).stroke();
      
      doc.fontSize(10).fillColor("gray").font("Helvetica").text(`Thank you for choosing ${organization.name}`, 50, bottom + 15, { align: "center" });
      doc.fontSize(8).text("Powered by ClinicOS", 50, bottom + 30, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
