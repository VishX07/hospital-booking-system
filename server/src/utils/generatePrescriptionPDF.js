import PDFDocument from 'pdfkit';

// ─── THEME ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1a5276',
  accent: '#2e86c1',
  light: '#eaf4fb',
  divider: '#c8d6df',
  text: '#1c2833',
  muted: '#7f8c8d',
  white: '#ffffff',
  rowAlt: '#f4f8fb',
  cardBg: '#f0f4f8',
  green: '#1e8449',
};

const FONT = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  oblique: 'Helvetica-Oblique',
};

const PAGE_W = 595.28; // A4 width  (pt)
const PAGE_H = 841.89; // A4 height (pt)
const ML = 45; // margin left
const MR = 45; // margin right
const CW = PAGE_W - ML - MR; // content width = 505.28

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────

const fmt = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const hRule = (doc, y, color = COLORS.divider, w = 0.5) => {
  doc
    .moveTo(ML, y)
    .lineTo(ML + CW, y)
    .lineWidth(w)
    .strokeColor(color)
    .stroke();
};

// Draws a filled section title bar and returns Y after it
const sectionBar = (doc, label, y) => {
  const barH = 24;
  doc.rect(ML, y, CW, barH).fill(COLORS.primary);
  doc
    .font(FONT.bold)
    .fontSize(8.5)
    .fillColor(COLORS.white)
    .text(label, ML + 12, y + 8, { width: CW - 24, characterSpacing: 0.8 });
  return y + barH;
};

// Label + value stacked pair — returns new Y
const labelValue = (doc, label, val, x, y, valW = 180) => {
  doc
    .font(FONT.regular)
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(label, x, y, { width: valW });
  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(val || 'N/A', x, y + 11, { width: valW });
  return y + 28; // height of one label+value block
};

// ─── SECTION 1 — HEADER ───────────────────────────────────────────────────────
const drawHeader = (doc) => {
  const y = 40;

  // Logo box
  doc
    .rect(ML, y, 62, 54)
    .lineWidth(1)
    .strokeColor(COLORS.divider)
    .fillColor(COLORS.light)
    .fillAndStroke();

  // doc
  //   .font(FONT.bold)
  //   .fontSize(6.5)
  //   .fillColor(COLORS.muted)
  //   .text('HOSPITAL\nLOGO', ML, y + 22, { width: 62, align: 'center' });
  // doc.image('src/assets/hospital_logoo.png', ML, y, { width: 62, height: 54 });
  // ↑ Replace above 2 lines with:
  //   doc.image("path/to/logo.png", ML, y, { width: 62, height: 62 });

  // Hospital name + tagline

  import path from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const logoPath = path.join(__dirname, '../assets/hospital_logoo.png');

  doc.image(logoPath, ML, y, {
    width: 62,
    height: 54,
  });

  const tx = ML + 76;
  doc
    .font(FONT.bold)
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text('MedCare Hospital', tx, y + 4);

  doc
    .font(FONT.regular)
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text('Healthcare Management System', tx, y + 31);

  doc
    .font(FONT.regular)
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      '123 Health Avenue, Pune, MH 411001  |  +91-20-1234-5678  |  info@medcare.in',
      tx,
      y + 46,
    );

  // Primary divider
  const ruleY = y + 74;
  hRule(doc, ruleY, COLORS.primary, 2);

  // Thin secondary accent line
  hRule(doc, ruleY + 3.5, COLORS.accent, 0.4);

  return ruleY + 14; // next Y
};

// ─── SECTION 2 — PATIENT / DOCTOR INFO CARD ──────────────────────────────────
const drawInfoCard = (doc, prescription, startY) => {
  const cardH = 145;
  const colMid = ML + CW / 2;

  // Card background + border
  doc
    .rect(ML, startY, CW, cardH)
    .lineWidth(0.6)
    .strokeColor(COLORS.divider)
    .fillColor(COLORS.cardBg)
    .fillAndStroke();

  // Vertical divider
  doc
    .moveTo(colMid, startY + 10)
    .lineTo(colMid, startY + cardH - 10)
    .lineWidth(0.5)
    .strokeColor(COLORS.divider)
    .stroke();

  const lx = ML + 14;
  const rx = colMid + 14;
  const vy = startY + 12; // first row top
  const gap = 36; // vertical gap between rows

  // Left column
  labelValue(doc, 'PATIENT', prescription.patientId?.fullName, lx, vy);
  const dob = prescription.patientId?.dateOfBirth;

  const age = dob
    ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'N/A';

  const gender = prescription.patientId?.gender
    ? prescription.patientId.gender.charAt(0).toUpperCase() +
      prescription.patientId.gender.slice(1)
    : 'N/A';
  doc
    .font(FONT.regular)
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(`${gender} • ${age} Years`, lx, vy + 26);

  labelValue(
    doc,
    'APPOINTMENT DATE',
    fmt(prescription.appointmentId?.appointmentDate),
    lx,
    vy + gap,
  );
  labelValue(
    doc,
    'TIME',
    prescription.appointmentId?.timeSlot || 'N/A',
    lx,
    vy + gap * 2,
  );

  // Right column
  const drName = prescription.doctorId?.userId?.fullName || 'N/A';
  labelValue(doc, 'DOCTOR', `Dr. ${drName}`, rx, vy);
  labelValue(
    doc,
    'Phone',
    prescription.doctorId?.userId?.phoneNumber || '—',
    rx,
    vy + gap,
  );
  labelValue(doc, 'GENERATED ON', fmt(new Date()), rx, vy + gap * 2);

  return startY + cardH + 18;
};

// ─── SECTION 3 — DIAGNOSIS ────────────────────────────────────────────────────
const drawDiagnosis = (doc, diagnosis, startY) => {
  let y = sectionBar(doc, 'DIAGNOSIS', startY);
  y += 10;

  doc
    .font(FONT.regular)
    .fontSize(10)
    .fillColor(COLORS.text)
    .text(diagnosis || 'Not specified', ML + 12, y, {
      width: CW - 24,
      lineGap: 4,
    });

  return doc.y + 16;
};

// ─── SECTION 4 — MEDICINES TABLE ─────────────────────────────────────────────
const drawMedicinesTable = (doc, medicines, startY) => {
  let y = sectionBar(doc, 'PRESCRIBED MEDICINES', startY);
  y += 8;

  const COL = {
    sno: { x: ML, w: 30 },
    name: { x: ML + 30, w: 172 },
    dosage: { x: ML + 202, w: 90 },
    freq: { x: ML + 292, w: 118 },
    duration: { x: ML + 410, w: 95 },
  };

  const ROW_H = 24;
  const HDR_H = 22;

  // ── Header row
  doc.rect(ML, y, CW, HDR_H).fill(COLORS.accent);

  const hdrCell = (text, col) => {
    doc
      .font(FONT.bold)
      .fontSize(8)
      .fillColor(COLORS.white)
      .text(text, col.x + 6, y + 7, { width: col.w - 10, lineBreak: false });
  };
  hdrCell('#', COL.sno);
  hdrCell('MEDICINE', COL.name);
  hdrCell('DOSAGE', COL.dosage);
  hdrCell('FREQUENCY', COL.freq);
  hdrCell('DURATION', COL.duration);

  y += HDR_H;

  if (!medicines || medicines.length === 0) {
    doc.rect(ML, y, CW, ROW_H).fill(COLORS.white);
    doc
      .font(FONT.oblique)
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text('No medicines prescribed.', ML + 12, y + 7, { width: CW - 24 });
    y += ROW_H;
  } else {
    medicines.forEach((med, i) => {
      const bg = i % 2 === 0 ? COLORS.white : COLORS.rowAlt;
      doc.rect(ML, y, CW, ROW_H).fill(bg);

      // bottom cell border
      doc
        .moveTo(ML, y + ROW_H)
        .lineTo(ML + CW, y + ROW_H)
        .lineWidth(0.25)
        .strokeColor(COLORS.divider)
        .stroke();

      const cell = (text, col) => {
        doc
          .font(FONT.regular)
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(text || '—', col.x + 6, y + 7, {
            width: col.w - 10,
            lineBreak: false,
          });
      };
      cell(String(i + 1), COL.sno);
      cell(med.name, COL.name);
      cell(med.dosage, COL.dosage);
      cell(med.frequency, COL.freq);
      cell(med.duration, COL.duration);

      // vertical col dividers
      [COL.name, COL.dosage, COL.freq, COL.duration].forEach((col) => {
        doc
          .moveTo(col.x, y)
          .lineTo(col.x, y + ROW_H)
          .lineWidth(0.25)
          .strokeColor(COLORS.divider)
          .stroke();
      });

      y += ROW_H;
    });
  }

  // Outer border around full table
  const tableTop = startY + 24; // below section bar
  const tableHeight = y - tableTop;
  doc
    .rect(ML, tableTop, CW, tableHeight)
    .lineWidth(0.6)
    .strokeColor(COLORS.divider)
    .stroke();

  return y + 18;
};

// ─── SECTION 5 — DOCTOR NOTES ────────────────────────────────────────────────
const drawNotes = (doc, notes, startY) => {
  if (!notes) return startY;

  let y = sectionBar(doc, "DOCTOR'S NOTES", startY);
  y += 10;

  doc.rect(ML, y, CW, 1).fill(COLORS.white); // spacing

  doc
    .font(FONT.oblique)
    .fontSize(9.5)
    .fillColor(COLORS.text)
    .text(notes, ML + 12, y, { width: CW - 24, lineGap: 4 });

  return doc.y + 16;
};

// ─── SECTION 6 — FOLLOW-UP ───────────────────────────────────────────────────
const drawFollowUp = (doc, followUpDate, startY) => {
  if (!followUpDate) return startY;

  let y = sectionBar(doc, 'FOLLOW-UP', startY);
  y += 12;

  doc
    .font(FONT.regular)
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text('Next visit scheduled on:', ML + 12, y, { continued: true });

  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.green)
    .text('  ' + fmt(followUpDate));

  return doc.y + 16;
};

// ─── SECTION 7 — FOOTER ──────────────────────────────────────────────────────
const drawFooter = (doc, doctorName) => {
  // const footerY = PAGE_H - 72;
  const footerY = 730;

  hRule(doc, footerY, COLORS.divider, 0.5);

  // Disclaimer — left aligned
  doc
    .font(FONT.regular)
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(
      'This prescription is electronically generated and valid without signature.',
      ML,
      footerY + 10,
      // { width: CW - 160, lineGap: 3 },
      {
        width: CW - 160,
        height: 30,
        lineGap: 2,
      },
    );

  // Signature block — right side
  // To add signature image later:
  //   doc.image("path/to/signature.png", ML + CW - 148, footerY + 4, { width: 120, height: 30 });
  const sigX = ML + CW - 148;
  doc
    .rect(sigX, footerY + 6, 148, 30)
    .lineWidth(0.4)
    .strokeColor(COLORS.divider)
    .stroke();
  doc
    .font(FONT.regular)
    .fontSize(7)
    .fillColor(COLORS.muted)
    .text('Authorised Signature', sigX, footerY + 24, {
      width: 148,
      align: 'center',
    });

  doc
    .font(FONT.bold)
    .fontSize(8.5)
    .fillColor(COLORS.primary)
    .text(`Dr. ${doctorName || ''}`, sigX, footerY + 40, {
      width: 148,
      align: 'center',
    });
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * generatePrescriptionPDF
 * @param {Object} prescription  Populated Mongoose prescription document
 * @param {Object} res           Express response object
 */
// export const generatePrescriptionPDF = (prescription, res) => {
//   const doc = new PDFDocument({
//     size: 'A4',
//     margins: { top: 40, bottom: 90, left: ML, right: MR },
//     info: {
//       Title: 'Medical Prescription',
//       Author: `Dr. ${prescription.doctorId?.userId?.fullName || ''}`,
//       Subject: 'Hospital Prescription',
//     },
//   });

//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader(
//     'Content-Disposition',
//     `inline; filename="prescription-${prescription._id}.pdf"`,
//   );
//   doc.pipe(res);

//   let y = drawHeader(doc);
//   y = drawInfoCard(doc, prescription, y);
//   y = drawDiagnosis(doc, prescription.diagnosis, y);
//   y = drawMedicinesTable(doc, prescription.medicines, y);
//   y = drawNotes(doc, prescription.notes, y);
//   drawFollowUp(doc, prescription.followUpDate, y);

//   doc.end();
// };

export const generatePrescriptionPDF = (prescription) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 40,
        bottom: 90,
        left: ML,
        right: MR,
      },
      info: {
        Title: 'Medical Prescription',

        Author: `Dr. ${prescription.doctorId?.userId?.fullName || ''}`,

        Subject: 'Hospital Prescription',
      },
    });

    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);

      resolve(pdfBuffer);
    });

    doc.on('error', reject);

    // PDF CONTENT
    let y = drawHeader(doc);

    y = drawInfoCard(doc, prescription, y);

    y = drawDiagnosis(doc, prescription.diagnosis, y);

    y = drawMedicinesTable(doc, prescription.medicines, y);

    y = drawNotes(doc, prescription.notes, y);

    drawFollowUp(doc, prescription.followUpDate, y);

    // drawFooter(doc, prescription.doctorId?.userId?.fullName);
    // Force footer on same page
    doc.switchToPage(0);

    drawFooter(doc, prescription.doctorId?.userId?.fullName);

    doc.end();
  });
};
