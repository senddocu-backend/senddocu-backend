const PDFDocument = require("pdfkit");

module.exports = function generateCertificatePDF(res, data) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // HTTP headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=certificate-${data.envelopeId}.pdf`
  );

  doc.pipe(res);

  // ---- PDF CONTENT ----
  doc
    .fontSize(20)
    .text("SendDocu Certificate of Completion", { align: "center" });

  doc.moveDown(2);

  doc.fontSize(12).text(`Envelope ID: ${data.envelopeId}`);
  doc.moveDown();

  doc.text(`Completed At: ${data.completedAt}`);
  doc.moveDown();

  doc.text("Snapshot Hash:");
  doc.font("Courier").fontSize(10).text(data.snapshotHash);
  doc.moveDown();

  doc.font("Helvetica").fontSize(12).text("Certificate Hash:");
  doc.font("Courier").fontSize(10).text(data.certificateHash);

  doc.moveDown(3);
  doc
    .fontSize(10)
    .text(
      "This certificate cryptographically proves the integrity and completion of the envelope.",
      { align: "center" }
    );

  doc.end();
};
