import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";
import multer from "multer";

const upload = multer();

/* ============================================================
    SERVICIOS - CRUD
============================================================ */

export const crearServicio = async (req, res) => {
  try {
    const barber_id = req.user.id;
    const { nombre, descripcion, precio, duracion, foto_url } = req.body;

    console.log("📝 Creando servicio:", { barber_id, nombre, precio, duracion });

    // Usar supabaseAdmin para evitar problemas de RLS
    const { data, error } = await supabaseAdmin
      .from("servicios")
      .insert([
        {
          barber_id,
          nombre,
          descripcion,
          precio: Number(precio),
          duracion: Number(duracion),
          foto_url: foto_url || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creando servicio:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ Servicio creado:", data);
    res.json(data);
  } catch (err) {
    console.error("❌ Error en crearServicio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerServiciosBarbero = async (req, res) => {
  try {
    const barber_id = req.params.barber_id;

    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("barber_id", barber_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error("Error obteniendo servicios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Servicio no encontrado" });

    res.json(data);
  } catch (err) {
    console.error("Error obteniendo servicio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const barber_id = req.user.id;
    const { nombre, descripcion, precio, duracion } = req.body;

    const { data, error } = await supabaseAdmin
      .from("servicios")
      .update({
        nombre,
        descripcion,
        precio: Number(precio),
        duracion: Number(duracion),
      })
      .eq("id", id)
      .eq("barber_id", barber_id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Servicio actualizado",
      data,
    });
  } catch (err) {
    console.error("Error actualizando servicio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const id = req.params.id;
    const barber_id = req.user.id;

    // Solo puede eliminar sus propios servicios
    const { error } = await supabaseAdmin
      .from("servicios")
      .delete()
      .eq("id", id)
      .eq("barber_id", barber_id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Servicio eliminado" });
  } catch (err) {
    console.error("Error eliminando servicio:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================================================
    SUBIR FOTO DE SERVICIO (multer)
============================================================ */
export const subirImagenServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const barber_id = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    // Verificar que el servicio pertenece al barbero
    const { data: servicio } = await supabaseAdmin
      .from("servicios")
      .select("barber_id")
      .eq("id", id)
      .single();

    if (!servicio || servicio.barber_id !== barber_id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const filename = `servicio-${id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("servicios")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo a storage:", uploadError);
      return res.status(400).json({ error: uploadError.message });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("servicios")
      .getPublicUrl(filename);

    await supabaseAdmin
      .from("servicios")
      .update({ foto_url: urlData.publicUrl })
      .eq("id", id);

    res.json({
      message: "Imagen subida exitosamente",
      url: urlData.publicUrl,
    });
  } catch (err) {
    console.error("Error subiendo imagen:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================================================
    SUBIR FOTO DE PERFIL DEL BARBERO (multer)
============================================================ */
export const subirFotoPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    const filename = `avatar-${userId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo avatar:", uploadError);
      return res.status(400).json({ error: uploadError.message });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filename);

    await supabaseAdmin
      .from("usuarios")
      .update({ foto_url: urlData.publicUrl })
      .eq("id", userId);

    res.json({
      message: "Foto de perfil actualizada",
      url: urlData.publicUrl,
    });
  } catch (err) {
    console.error("Error subiendo foto de perfil:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================================================
    OBTENER URL FIRMADA PARA UPLOAD (opcional)
============================================================ */
export const uploadFotoServicio = async (req, res) => {
  try {
    const { fileName } = req.body;

    const { data, error } = await supabase.storage
      .from("servicios")
      .createSignedUploadUrl(fileName);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ url: data.signedUrl, token: data.token });
  } catch (err) {
    console.error("Error creando URL de carga:", err);
    res.status(500).json({ error: "Error creando URL de carga" });
  }
};  