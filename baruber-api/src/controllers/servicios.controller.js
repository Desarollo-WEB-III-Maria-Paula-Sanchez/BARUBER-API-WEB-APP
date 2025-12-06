import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";
import multer from "multer";

const upload = multer();

export const crearServicio = async (req, res) => {
  const barber_id = req.user.id;
  const { nombre, descripcion, precio, duracion, foto_url } = req.body;

  const { data, error } = await supabase
    .from("servicios")
    .insert([{ barber_id, nombre, descripcion, precio, duracion, foto_url }])
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const obtenerServiciosBarbero = async (req, res) => {
  const barber_id = req.params.barber_id;

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("barber_id", barber_id);

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const eliminarServicio = async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from("servicios")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json(error);

  res.json({ message: "Servicio eliminado" });
};

/* =======================
   NUEVOS ENDPOINTS
   ======================= */

export const obtenerServicioPorId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, duracion } = req.body;

  const { data, error } = await supabase
    .from("servicios")
    .update({
      nombre,
      descripcion,
      precio,
      duracion,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json({
    message: "Servicio actualizado",
    data,
  });
};

export const subirImagenServicio = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Archivo requerido" });
  }

  const filename = `${id}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("servicios")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) return res.status(400).json(uploadError);

  const { data: urlData } = supabaseAdmin.storage
    .from("servicios")
    .getPublicUrl(filename);

  await supabase
    .from("servicios")
    .update({ foto_url: urlData.publicUrl })
    .eq("id", id);

  res.json({
    message: "Imagen subida",
    url: urlData.publicUrl,
  });
};

export const subirFotoPerfil = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "Archivo requerido" });

  const filename = `${userId}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) return res.status(400).json(uploadError);

  const { data: urlData } = supabaseAdmin.storage
    .from("avatars")
    .getPublicUrl(filename);

  await supabase
    .from("usuarios")
    .update({ foto: urlData.publicUrl })
    .eq("id", userId);

  res.json({
    message: "Foto de perfil actualizada",
    url: urlData.publicUrl,
  });
};
