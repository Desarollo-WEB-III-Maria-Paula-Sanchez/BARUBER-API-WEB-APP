import { supabase } from "../config/supabase.js";
import { generarPDF } from "../utils/pdf.js";
import { v4 as uuidv4 } from "uuid";

export const generarFactura = async (req, res) => {
  const { reserva_id } = req.body;

  const { data: reserva, error } = await supabase
    .from("reservas")
    .select(`*, servicios(nombre, precio)`)
    .eq("id", reserva_id)
    .single();

  if (error) return res.status(400).json(error);

  const pdfBuffer = await generarPDF(reserva);

  const fileName = `facturas/${uuidv4()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("facturas")
    .upload(fileName, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true
    });

  if (uploadError) return res.status(400).json(uploadError);

  const { data: urlData } = supabase.storage
    .from("facturas")
    .getPublicUrl(fileName);

  await supabase
    .from("reservas")
    .update({ factura_url: urlData.publicUrl })
    .eq("id", reserva_id);

  res.json({
    message: "Factura generada",
    url: urlData.publicUrl
  });
};
