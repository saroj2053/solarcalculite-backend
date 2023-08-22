const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generatePDF = (data, filename) => {
  const pdfFile = new PDFDocument();

  pdfFile.text(JSON.stringify(data, null, 2));

  pdfFile.pipe(fs.createWriteStream(filename));
  pdfFile.end();

  return filename;
};
