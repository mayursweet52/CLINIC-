import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

export async function generateInvoicePDF(billId: string): Promise<{ buffer: Buffer; path: string }> {
  const bill = await prisma.billing.findUnique({
    where: { id: billId },
    include: {
      organization: true,
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  if (!bill) {
    throw new Error('Bill not found');
  }

  const org = bill.organization;
  const patient = bill.appointment.patient;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve({ buffer: pdfData, path: filePath });
    });
    doc.on('error', reject);

    const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    
    const filePath = path.join(invoicesDir, `${bill.id}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(20)
      .text(org.name, { align: 'center' })
      .fontSize(10)
      .text(org.address || 'Address Not Provided', { align: 'center' })
      .text(`${org.city || ''} ${org.state || ''}`, { align: 'center' })
      .text(`Phone: ${org.phone || 'N/A'}`, { align: 'center' })
      .moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

    // Patient and Invoice Info
    doc.fontSize(12).text(`Invoice No: ${bill.invoiceNo}`);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`);
    if (bill.paidAt) {
      doc.text(`Paid At: ${new Date(bill.paidAt).toLocaleDateString()}`);
    }
    doc.moveDown();
    
    doc.text(`Patient: ${patient.name}`);
    doc.text(`Phone: ${patient.phone}`);
    doc.text(`Patient Code: ${patient.patientCode}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Amount', 400, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Line Items
    let y = tableTop + 25;
    doc.font('Helvetica');

    if (bill.consultationFee > 0) {
      doc.text('Consultation Fee', 50, y);
      doc.text(`Rs. ${bill.consultationFee.toFixed(2)}`, 400, y, { width: 100, align: 'right' });
      y += 20;
    }

    if (bill.medicineCharges > 0) {
      doc.text('Medicine Charges', 50, y);
      doc.text(`Rs. ${bill.medicineCharges.toFixed(2)}`, 400, y, { width: 100, align: 'right' });
      y += 20;
    }
    
    if (bill.discount > 0) {
      doc.text('Discount', 50, y);
      doc.text(`- Rs. ${bill.discount.toFixed(2)}`, 400, y, { width: 100, align: 'right' });
      y += 20;
    }

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    doc.font('Helvetica-Bold');
    doc.text('Total', 50, y);
    doc.text(`Rs. ${bill.totalAmount.toFixed(2)}`, 400, y, { width: 100, align: 'right' });

    doc.moveDown(4);
    doc.font('Helvetica-Oblique').text('Thank you for visiting.', { align: 'center' });

    doc.end();
  });
}
