import PDFDocument from "pdfkit";

export const generarPDF = (reserva) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Colores
    const primaryColor = '#2563eb'; // Azul
    const secondaryColor = '#64748b'; // Gris
    const accentColor = '#10b981'; // Verde

    // ==========================================
    // HEADER - Logo y título
    // ==========================================
    doc
      .fontSize(32)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('BARUBER', 50, 50);

    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .font('Helvetica')
      .text('Tu barbería de confianza', 50, 85);

    // Línea decorativa debajo del header
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(50, 110)
      .lineTo(545, 110)
      .stroke();

    // ==========================================
    // TÍTULO DE FACTURA
    // ==========================================
    doc
      .fontSize(24)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('FACTURA', 400, 50, { align: 'right' });

    // Número de factura
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .font('Helvetica')
      .text(`No. ${reserva.id.substring(0, 8).toUpperCase()}`, 400, 80, { align: 'right' });

    // Fecha de emisión
    const fechaEmision = new Date().toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Fecha: ${fechaEmision}`, 400, 95, { align: 'right' });

    // ==========================================
    // INFORMACIÓN DEL CLIENTE
    // ==========================================
    let yPos = 140;

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('INFORMACIÓN DEL CLIENTE', 50, yPos);

    yPos += 20;

    // Rectángulo con fondo gris claro
    doc
      .rect(50, yPos, 250, 80)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    yPos += 15;

    doc
      .fontSize(10)
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(`Cliente: ${reserva.usuarios?.nombre || 'N/A'}`, 60, yPos);

    yPos += 20;
    doc.text(`Email: ${reserva.usuarios?.email || 'N/A'}`, 60, yPos);

    yPos += 20;
    doc.text(`Teléfono: ${reserva.usuarios?.telefono || 'N/A'}`, 60, yPos);

    // ==========================================
    // INFORMACIÓN DE LA RESERVA
    // ==========================================
    yPos = 140;

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('DETALLES DE LA CITA', 320, yPos);

    yPos += 20;

    // Rectángulo con fondo gris claro
    doc
      .rect(320, yPos, 225, 80)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    yPos += 15;

    // Formatear fecha
    const fechaCita = new Date(reserva.fecha + 'T00:00:00').toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc
      .fontSize(10)
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(`Fecha: ${fechaCita}`, 330, yPos);

    yPos += 20;
    doc.text(`Hora: ${reserva.hora}`, 330, yPos);

    yPos += 20;
    const estadoBadge = reserva.estado.toUpperCase();
    const estadoColor = reserva.estado === 'completada' ? accentColor : primaryColor;
    doc
      .fillColor(estadoColor)
      .font('Helvetica-Bold')
      .text(`Estado: ${estadoBadge}`, 330, yPos);

    // ==========================================
    // TABLA DE SERVICIOS
    // ==========================================
    yPos = 270;

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('SERVICIOS', 50, yPos);

    yPos += 25;

    // Header de la tabla
    doc
      .rect(50, yPos, 495, 30)
      .fillAndStroke(primaryColor, primaryColor);

    doc
      .fontSize(10)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('Descripcion', 60, yPos + 10, { width: 280 })
      .text('Duracion', 350, yPos + 10, { width: 80 })
      .text('Precio', 450, yPos + 10, { width: 85, align: 'right' });

    yPos += 30;

    // Contenido de la tabla
    doc
      .rect(50, yPos, 495, 40)
      .fillAndStroke('#ffffff', '#e2e8f0');

    doc
      .fontSize(10)
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(reserva.servicios.nombre, 60, yPos + 15, { width: 280 })
      .text(`${reserva.servicios.duracion} min`, 350, yPos + 15, { width: 80 })
      .font('Helvetica-Bold')
      .text(`CRC ${reserva.servicios.precio.toLocaleString('es-CR')}`, 450, yPos + 15, { 
        width: 85, 
        align: 'right' 
      });

    yPos += 40;

    // ==========================================
    // TOTAL
    // ==========================================
    yPos += 20;

    // Caja del total
    doc
      .rect(350, yPos, 195, 50)
      .fillAndStroke('#f0f9ff', '#2563eb');

    yPos += 15;

    doc
      .fontSize(14)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('TOTAL A PAGAR:', 360, yPos, { width: 100 });

    doc
      .fontSize(18)
      .fillColor(accentColor)
      .text(`CRC ${reserva.servicios.precio.toLocaleString('es-CR')}`, 450, yPos, { 
        width: 85, 
        align: 'right' 
      });

    // ==========================================
    // NOTAS Y PIE DE PÁGINA
    // ==========================================
    yPos = 500;

    // Línea separadora
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, yPos)
      .lineTo(545, yPos)
      .stroke();

    yPos += 20;

    doc
      .fontSize(9)
      .fillColor(secondaryColor)
      .font('Helvetica-Oblique')
      .text('Notas:', 50, yPos);

    yPos += 15;

    doc
      .fontSize(8)
      .font('Helvetica')
      .text('• Gracias por confiar en BARUBER para tu cuidado personal', 50, yPos);

    yPos += 12;
    doc.text('• Esta factura es un comprobante de tu servicio', 50, yPos);

    yPos += 12;
    doc.text('• Para cualquier consulta, contáctanos a través de nuestros canales oficiales', 50, yPos);

    // ==========================================
    // FOOTER
    // ==========================================
    yPos = 720;

    doc
      .fontSize(8)
      .fillColor(secondaryColor)
      .font('Helvetica')
      .text('BARUBER - Sistema de Gestión de Barbería', 50, yPos, { 
        align: 'center',
        width: 495 
      });

    yPos += 12;
    doc.text('www.baruber.com | contacto@baruber.com | +506 1234-5678', 50, yPos, { 
      align: 'center',
      width: 495 
    });

    // Línea final decorativa
    doc
      .strokeColor(primaryColor)
      .lineWidth(3)
      .moveTo(50, 760)
      .lineTo(545, 760)
      .stroke();

    doc.end();
  });
};