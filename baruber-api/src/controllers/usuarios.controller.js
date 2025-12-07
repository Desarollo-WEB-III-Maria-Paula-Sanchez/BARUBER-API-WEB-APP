// controllers/usuarios.controller.js
import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";

/* ============================================================
   Obtener perfil del usuario autenticado
   ============================================================ */
export const obtenerPerfil = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabaseAdmin
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

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .update({ nombre, telefono, foto_url })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando perfil:", error);
    return res.status(400).json(error);
  }

  res.json(data);
};

/* ============================================================
   Subir foto de perfil
   ============================================================ */
export const subirFotoPerfil = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Archivo requerido" });
  }

  const filename = `${userId}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error subiendo archivo:", uploadError);
    return res.status(400).json(uploadError);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("avatars")
    .getPublicUrl(filename);

  const { error: updateError } = await supabaseAdmin
    .from("usuarios")
    .update({ foto_url: urlData.publicUrl })
    .eq("id", userId);

  if (updateError) {
    console.error("Error actualizando URL en BD:", updateError);
    return res.status(400).json(updateError);
  }

  res.json({
    message: "Foto actualizada",
    url: urlData.publicUrl,
  });
};

/* ============================================================
   ✅ NUEVO: Registrar token de dispositivo para notificaciones
   ============================================================ */
export const registrarDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, platform = "android" } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token requerido" });
    }

    console.log(`📱 Registrando token para usuario ${userId}`);

    // Verificar si el token ya existe
    const { data: existingToken } = await supabaseAdmin
      .from("device_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (existingToken) {
      // Actualizar el token existente
      const { data, error } = await supabaseAdmin
        .from("device_tokens")
        .update({
          user_id: userId,
          is_active: true,
          platform,
          updated_at: new Date().toISOString(),
        })
        .eq("token", token)
        .select()
        .single();

      if (error) {
        console.error("Error actualizando token:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("✅ Token actualizado correctamente");
      return res.json({
        message: "Token actualizado",
        data,
      });
    }

    // Insertar nuevo token
    const { data, error } = await supabaseAdmin
      .from("device_tokens")
      .insert({
        user_id: userId,
        token,
        platform,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error insertando token:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ Token registrado correctamente");
    res.json({
      message: "Token registrado exitosamente",
      data,
    });
  } catch (err) {
    console.error("Error en registrarDeviceToken:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================================================
   ✅ NUEVO: Desactivar token de dispositivo (logout)
   ============================================================ */
export const desactivarDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token requerido" });
    }

    const { error } = await supabaseAdmin
      .from("device_tokens")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("token", token);

    if (error) {
      console.error("Error desactivando token:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Token desactivado correctamente" });
  } catch (err) {
    console.error("Error en desactivarDeviceToken:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};