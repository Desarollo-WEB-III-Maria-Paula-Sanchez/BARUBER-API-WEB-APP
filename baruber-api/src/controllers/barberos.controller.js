// controllers/barberos.controller.js

import { supabaseAdmin } from "../utils/supabaseAdmin.js";

/* ============================================================
   Obtener todos los barberos (para la app móvil)
   ============================================================ */
export const obtenerBarberos = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, email, telefono, foto_url")
      .eq("rol", "barbero")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error obteniendo barberos:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Error en obtenerBarberos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================================================
   Obtener información de un barbero específico CON HORARIOS
   ============================================================ */
export const obtenerBarberoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener datos básicos del barbero
    const { data: barbero, error: barberoError } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, email, telefono, foto_url")
      .eq("id", id)
      .eq("rol", "barbero")
      .maybeSingle();

    if (barberoError) {
      console.error("Error obteniendo barbero:", barberoError);
      return res.status(400).json({ error: barberoError.message });
    }

    if (!barbero) {
      return res.status(404).json({ error: "Barbero no encontrado" });
    }

    // 2. ✅ NUEVO: Obtener horarios del barbero
    const { data: horarios, error: horariosError } = await supabaseAdmin
      .from("horarios_barbero")
      .select("dia_semana, trabaja, hora_inicio, hora_fin")
      .eq("barber_id", id)
      .order("dia_semana", { ascending: true });

    if (horariosError) {
      console.error("Error obteniendo horarios:", horariosError);
    }

    // 3. ✅ Retornar barbero con sus horarios
    return res.json({
      ...barbero,
      horarios: horarios || []
    });

  } catch (err) {
    console.error("Error en obtenerBarberoPorId:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};