import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";

/* ============================================================
   Obtener perfil del usuario autenticado
   ============================================================ */
export const obtenerPerfil = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

/* ============================================================
   Actualizar perfil (nombre, teléfono, foto_url)
   ============================================================ */
export const actualizarPerfil = async (req, res) => {
  const userId = req.user.id;
  const { nombre, telefono, foto_url } = req.body;

  const { data, error } = await supabase
    .from("usuarios")
    .update({ nombre, telefono, foto: foto_url })
    .eq("id", userId)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

/* ============================================================
   Subir foto de perfil — nuevo
   ============================================================ */
export const subirFotoPerfil = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Archivo requerido" });
  }

  // Nombre único de archivo
  const filename = `${userId}-${Date.now()}.jpg`;

  // Subir a bucket "avatars"
  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) return res.status(400).json(uploadError);

  // Obtener URL pública
  const { data: urlData } = supabaseAdmin.storage
    .from("avatars")
    .getPublicUrl(filename);

  // Guardar en BD
  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ foto: urlData.publicUrl })
    .eq("id", userId);

  if (updateError) return res.status(400).json(updateError);

  res.json({
    message: "Foto actualizada",
    url: urlData.publicUrl,
  });
};
