import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js"; // ← IMPORTANTE

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
    user: data.user
  });
};

export const loginGoogle = async (req, res) => {
  const { redirect_to } = req.query;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirect_to || "http://localhost:3000/auth/callback"
    }
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};

export const registrar = async (req, res) => {
  const { email, password, nombre } = req.body;

  // 1️⃣ Registrar en Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json(error);

  const userId = data.user.id;

  // 2️⃣ Auto-confirmar email (EVITA el error email_not_confirmed)
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirmed_at: new Date().toISOString(),
  });

  // 3️⃣ Crear registro en tabla usuarios
  const { error: insertError } = await supabase
    .from("usuarios")
    .insert({
      id: userId,
      email,
      nombre,
      rol: "cliente", // default, después puedes actualizar
    });

  if (insertError)
    return res.status(400).json({ message: "Error insertando perfil", insertError });

  return res.json({
    message: "Usuario registrado",
    user: data.user
  });
};

export const refrescarToken = async (req, res) => {
  const { refresh_token } = req.body;

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  });

  if (error) return res.status(400).json(error);

  return res.json(data);
};

export const obtenerSesion = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(400).json(error);

  return res.json(data);
};
