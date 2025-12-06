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
    LOGIN GOOGLE CLIENTE (flujo normal)
============================================================ */
export const loginGoogle = async (req, res) => {
  const redirectTo = "http://localhost:5173/login";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};

/* ============================================================
    REGISTRO CLIENTE
============================================================ */
export const registrar = async (req, res) => {
  const { email, password, nombre } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json(error);

  const userId = data.user.id;

  await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirmed_at: new Date().toISOString(),
  });

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
    REGISTRO BARBERO
============================================================ */
export const registrarBarbero = async (req, res) => {
  const { email, password, nombre } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json(error);

  const userId = data.user.id;

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
    LOGIN GOOGLE BARBERO (INICIA OAUTH)
    IMPORTANTE: flowType: "pkce" → evita #access_token
============================================================ */
export const loginGoogleBarbero = async (req, res) => {
  // Redirige directamente al frontend, no al backend
  const FRONTEND_CALLBACK = "http://localhost:5173/dashboard";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: FRONTEND_CALLBACK,
      // NO uses flowType: "pkce" aquí
      scopes: "openid email profile",
    },
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};


/* ============================================================
    CALLBACK GOOGLE BARBERO
    Aquí llega Google → Supabase transforma CODE → token
    Luego insertamos usuario si es nuevo
============================================================ */
export const googleCallbackBarbero = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      console.error("❌ No llegó 'code' en el callback");
      return res.redirect("http://localhost:5173/login?error=no_code");
    }

    // INTERCAMBIAR CODE POR TOKEN MEDIANTE OAUTH BACKEND
    const resp = await fetch(
      "https://xuogfwkdkwycumlscyna.supabase.co/auth/v1/token?grant_type=authorization_code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          code,
          redirect_uri: "http://localhost:3000/auth/google-barbero/callback",
        }),
      }
    );

    const tokens = await resp.json();

    if (!tokens.access_token) {
      console.error("❌ No se obtuvo access_token:", tokens);
      return res.redirect("http://localhost:5173/login?error=invalid_code");
    }

    const token = tokens.access_token;

    // Obtener datos del usuario con ese token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("❌ Error obteniendo usuario:", error);
      return res.redirect("http://localhost:5173/login?error=user_not_found");
    }

    const user = data.user;

    // Buscar perfil en BD
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!perfil) {
      await supabaseAdmin.from("usuarios").insert({
        id: user.id,
        email: user.email,
        nombre: user.user_metadata.full_name,
        rol: "barbero",
      });
    }

    return res.redirect(`http://localhost:5173/dashboard?access_token=${token}`);
  } catch (err) {
    console.error("❌ Error en callback Google:", err);
    return res.redirect("http://localhost:5173/login?error=callback_crash");
  }
};



/* ============================================================
    OBTENER SESIÓN
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
      },
    });
  } catch (err) {
    console.error("Error en obtenerSesion:", err);
    return res.status(500).json({ error: "Error obteniendo sesión" });
  }
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
