import PDFDocument from "pdfkit";

export const generarPDF = (reserva) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text("Factura BARUBER");
    doc.moveDown();

    doc.fontSize(14).text(`Reserva ID: ${reserva.id}`);
    doc.text(`Servicio: ${reserva.servicios.nombre}`);
    doc.text(`Precio: ₡${reserva.servicios.precio}`);
    doc.text(`Fecha: ${reserva.fecha}`);
    doc.text(`Hora: ${reserva.hora}`);

    doc.end();
  });
};
