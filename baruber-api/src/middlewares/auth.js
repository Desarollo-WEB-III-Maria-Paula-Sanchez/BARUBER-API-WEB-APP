import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    // Validar token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = data.user;

    // Cargar perfil desde tabla usuarios con SERVICE ROLE (ignora RLS)
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (perfilError) {
      console.error("Error obteniendo perfil:", perfilError);
      return res.status(500).json({ error: "Error obteniendo perfil" });
    }

    if (!perfil) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    req.user.perfil = perfil;

    next();
  } catch (err) {
    console.error("Error en verificarToken:", err);
    res.status(500).json({ error: "Error de autenticación" });
  }
};

// Middleware que solo permite BARBEROS
export const soloBarbero = (req, res, next) => {
  if (!req.user?.perfil || req.user.perfil.rol !== "barbero") {
    return res.status(403).json({ error: "Solo barberos" });
  }
  next();
};

// Solo superadmins
export const soloSuperadmin = (req, res, next) => {
  if (!req.user?.perfil || req.user.perfil.rol !== "superadmin") {
    return res.status(403).json({ error: "Solo superadmins" });
  }
  next();
};
