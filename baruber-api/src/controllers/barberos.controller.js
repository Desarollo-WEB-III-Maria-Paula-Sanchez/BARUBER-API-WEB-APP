// controllers/barberos.controller.js
// AGREGAR ESTE NUEVO ARCHIVO A TU API

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
   Obtener información de un barbero específico
   ============================================================ */
export const obtenerBarberoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, email, telefono, foto_url")
      .eq("id", id)
      .eq("rol", "barbero")
      .maybeSingle();

    if (error) {
      console.error("Error obteniendo barbero:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Barbero no encontrado" });
    }

    return res.json(data);
  } catch (err) {
    console.error("Error en obtenerBarberoPorId:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// routes/barberos.routes.js
// AGREGAR ESTE NUEVO ARCHIVO A TU API

import express from "express";
import { obtenerBarberos, obtenerBarberoPorId } from "../controllers/barberos.controller.js";

const router = express.Router();

// Obtener todos los barberos (público para clientes)
router.get("/", obtenerBarberos);

// Obtener un barbero específico
router.get("/:id", obtenerBarberoPorId);

export default router;

// server.js o app.js
// AGREGAR ESTA LÍNEA A TU ARCHIVO PRINCIPAL

import barberosRoutes from "./routes/barberos.routes.js";

// ... otras importaciones ...

app.use("/api/barberos", barberosRoutes);