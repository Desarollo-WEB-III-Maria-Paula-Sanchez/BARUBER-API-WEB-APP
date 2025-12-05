import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";

/* ============================================================
    LOGIN EMAIL (clientes y barberos)
   ============================================================ */
export const loginEmail = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json(error);

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  });
};

/* ============================================================
    LOGIN GOOGLE (solo clientes)
   ============================================================ */
export const loginGoogle = async (req, res) => {
  const { redirect_to } = req.query;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirect_to || "http://localhost:3000/auth/callback",
    },
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};

/* ============================================================
    REGISTRO CLIENTE (rol = cliente)
   ============================================================ */
export const registrar = async (req, res) => {
  const { email, password, nombre } = req.body;

  // Registrar usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json(error);

  const userId = data.user.id;

  // Confirmar email automáticamente
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirmed_at: new Date().toISOString(),
  });

  // Insertar en tabla usuarios
  const { error: insertError } = await supabase.from("usuarios").insert({
    id: userId,
    email,
    nombre,
    rol: "cliente",
  });

  if (insertError)
    return res.status(400).json({ message: "Error insertando perfil", insertError });

  return res.json({
    message: "Cliente registrado",
    user: data.user,
  });
};

/* ============================================================
    REGISTRO BARBERO (rol = barbero)
   ============================================================ */
export const registrarBarbero = async (req, res) => {
  const { email, password, nombre } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json(error);

  const userId = data.user.id;

  // Auto-confirmación de correo
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirmed_at: new Date().toISOString(),
  });

  const { error: insertError } = await supabase.from("usuarios").insert({
    id: userId,
    email,
    nombre,
    rol: "barbero",
  });

  if (insertError) return res.status(400).json(insertError);

  return res.json({
    message: "Barbero registrado",
    user: data.user,
  });
};

/* ============================================================
    LOGIN GOOGLE BARBERO (solo web barbero)
   ============================================================ */
export const loginGoogleBarbero = async (req, res) => {
  const { redirect_to } = req.query;

  const callbackUrl =
    redirect_to || "http://localhost:3000/api/auth/google-barbero/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};

/* ============================================================
    CALLBACK GOOGLE BARBERO → asigna rol barbero
   ============================================================ */
export const googleCallbackBarbero = async (req, res) => {
  const token = req.query.token;

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.redirect("http://localhost:5173/login?error=google");

  const user = data.user;

  // Verificar si el perfil ya existe
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Si no existe → crearlo como barbero
  if (!perfil) {
    await supabaseAdmin.from("usuarios").insert({
      id: user.id,
      email: user.email,
      nombre: user.user_metadata.full_name,
      rol: "barbero",
    });
  }

  // Redirigir al frontend del barbero con token
  return res.redirect(`http://localhost:5173/dashboard?access_token=${token}`);
};

/* ============================================================
    REFRESCAR TOKEN
   ============================================================ */
export const refrescarToken = async (req, res) => {
  const { refresh_token } = req.body;

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token,
  });

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
    OBTENER SESIÓN (requiere verificarToken middleware)
   ============================================================ */
export const obtenerSesion = async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        nombre: req.user.perfil.nombre,
        rol: req.user.perfil.rol,
        telefono: req.user.perfil.telefono,
        foto: req.user.perfil.foto,
      }
    });
  } catch (err) {
    console.error("Error en obtenerSesion:", err);
    return res.status(500).json({ error: "Error obteniendo sesión" });
  }
};
