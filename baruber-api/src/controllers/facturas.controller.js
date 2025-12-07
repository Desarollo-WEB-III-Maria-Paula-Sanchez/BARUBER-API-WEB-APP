import { supabaseAdmin } from "../utils/supabaseAdmin.js";
import { generarPDF } from "../utils/pdf.js";
import { v4 as uuidv4 } from "uuid";

export const generarFactura = async (req, res) => {
  const { reserva_id } = req.body;
  const barber_id = req.user.id;

  try {
    // Obtener la reserva con toda la información necesaria
    const { data: reserva, error } = await supabaseAdmin
      .from("reservas")
      .select(`
        *,
        servicios(nombre, precio, duracion),
        usuarios!reservas_cliente_id_fkey(nombre, email, telefono)
      `)
      .eq("id", reserva_id)
      .eq("barber_id", barber_id)
      .single();

    if (error) {
      console.error("Error obteniendo reserva:", error);
      return res.status(400).json({ error: "Reserva no encontrada" });
    }

    // Validar que la reserva esté completada
    if (reserva.estado !== "completada") {
      return res.status(400).json({ 
        error: "Solo se pueden generar facturas para reservas completadas" 
      });
    }

    // Validar que no tenga ya una factura
    if (reserva.factura_url) {
      return res.json({
        message: "La factura ya existe",
        url: reserva.factura_url
      });
    }

    // Generar el PDF
    const pdfBuffer = await generarPDF(reserva);

    // Nombre único para el archivo
    const fileName = `facturas/${reserva_id}-${uuidv4()}.pdf`;

    // Subir a Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("facturas")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false
      });

    if (uploadError) {
      console.error("Error subiendo factura:", uploadError);
      return res.status(400).json({ error: "Error al subir la factura" });
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from("facturas")
      .getPublicUrl(fileName);

    // Actualizar la reserva con la URL de la factura
    const { error: updateError } = await supabaseAdmin
      .from("reservas")
      .update({ factura_url: urlData.publicUrl })
      .eq("id", reserva_id);

    if (updateError) {
      console.error("Error actualizando reserva:", updateError);
      return res.status(400).json({ error: "Error al guardar la factura" });
    }

    // También crear registro en tabla facturas si existe
    const { error: facturaError } = await supabaseAdmin
      .from("facturas")
      .insert({
        reserva_id: reserva_id,
        pdf_url: urlData.publicUrl,
        monto: reserva.servicios.precio,
        metodo_pago: 'efectivo'
      });

    if (facturaError) {
      console.error("Advertencia: No se pudo crear registro en tabla facturas:", facturaError);
      // No retornar error porque la factura ya se generó correctamente
    }

    res.json({
      message: "Factura generada exitosamente",
      url: urlData.publicUrl
    });

  } catch (err) {
    console.error("Error generando factura:", err);
    res.status(500).json({ error: "Error interno al generar factura" });
  }
};