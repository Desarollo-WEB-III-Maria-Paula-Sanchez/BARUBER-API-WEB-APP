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
    LOGIN GOOGLE CLIENTE (NUEVO - Implicit Flow)
    → Similar al barbero pero asigna rol "cliente"
============================================================ */
export const loginGoogleCliente = async (req, res) => {
  // Redirige al frontend (app móvil usará deep link)
  const FRONTEND_CALLBACK = "http://localhost:5173/login"; // Para web
  // En producción: "baruber://auth/callback" para app móvil

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: FRONTEND_CALLBACK,
      scopes: "openid email profile",
    },
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};

/* ============================================================
    CALLBACK GOOGLE CLIENTE (NUEVO)
    Procesa el código OAuth y asigna rol "cliente"
============================================================ */
export const googleCallbackCliente = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      console.error("❌ No llegó 'code' en el callback");
      return res.redirect("http://localhost:5173/login?error=no_code");
    }

    // INTERCAMBIAR CODE POR TOKEN
    const resp = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${process.env.API_URL || "http://localhost:3000"}/auth/google-cliente/callback`,
        }),
      }
    );

    const tokens = await resp.json();

    if (!tokens.access_token) {
      console.error("❌ No se obtuvo access_token:", tokens);
      return res.redirect("http://localhost:5173/login?error=invalid_code");
    }

    const token = tokens.access_token;

    // Obtener datos del usuario
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

    // ✅ Si no existe, crear con ROL "CLIENTE"
    if (!perfil) {
      await supabaseAdmin.from("usuarios").insert({
        id: user.id,
        email: user.email,
        nombre: user.user_metadata.full_name || user.email.split('@')[0],
        rol: "cliente", // ← ROL CLIENTE
        foto_url: user.user_metadata.avatar_url || null,
      });
    }

    // Retornar tokens al frontend
    return res.redirect(`http://localhost:5173/login?access_token=${token}&refresh_token=${tokens.refresh_token}`);
  } catch (err) {
    console.error("❌ Error en callback Google Cliente:", err);
    return res.redirect("http://localhost:5173/login?error=callback_crash");
  }
};

/* ============================================================
    LOGIN GOOGLE BARBERO - ✅ FIX APLICADO
============================================================ */
export const loginGoogleBarbero = async (req, res) => {
  const FRONTEND_CALLBACK = "http://localhost:5173/dashboard";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: FRONTEND_CALLBACK, 
      scopes: "openid email profile",
    },
  });

  if (error) return res.status(400).json(error);

  return res.json({ url: data.url });
};


/* ============================================================
    CALLBACK GOOGLE BARBERO - ✅ FIX APLICADO
============================================================ */
export const googleCallbackBarbero = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      console.error("❌ No llegó 'code' en el callback");
      return res.redirect("http://localhost:5173/login?error=no_code");
    }

    const resp = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`,
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
    const refreshToken = tokens.refresh_token; // ✅ FIX: Capturar refresh_token

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("❌ Error obteniendo usuario:", error);
      return res.redirect("http://localhost:5173/login?error=user_not_found");
    }

    const user = data.user;

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!perfil) {
      await supabaseAdmin.from("usuarios").insert({
        id: user.id,
        email: user.email,
        nombre: user.user_metadata.full_name || user.email.split('@')[0],
        rol: "barbero",
        foto_url: user.user_metadata.avatar_url || null,
      });
    }

    // ✅ FIX: Incluir refresh_token en la redirección
    return res.redirect(
      `http://localhost:5173/dashboard?access_token=${token}&refresh_token=${refreshToken}`
    );
  } catch (err) {
    console.error("❌ Error en callback Google:", err);
    return res.redirect("http://localhost:5173/login?error=callback_crash");
  }
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
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
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
        foto: req.user.perfil.foto_url,
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

/* ============================================================
    LOGIN CON GOOGLE TOKEN (Para app móvil)
============================================================ */
export const loginConGoogleToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID Token requerido" });
    }

    console.log("🔐 Validando ID Token de Google...");

    // ✅ Validar token con Supabase (método oficial)
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      console.error("❌ Error validando token:", error);
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;
    const session = data.session;

    if (!user || !session) {
      return res.status(400).json({ error: "No se pudo autenticar con Google" });
    }

    // ✅ Verificar si existe el perfil en la tabla usuarios
    const { data: perfil } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // ✅ Si no existe, crear perfil automáticamente con ROL "CLIENTE"
    if (!perfil) {
      console.log("📝 Creando perfil de cliente para:", user.email);
      
      const { error: insertError } = await supabaseAdmin
        .from("usuarios")
        .insert({
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.full_name || user.email.split('@')[0],
          rol: "cliente", // ✅ IMPORTANTE: Asignar rol cliente
          foto_url: user.user_metadata?.avatar_url || null,
          telefono: null,
        });

      if (insertError) {
        console.error("❌ Error creando perfil:", insertError);
        return res.status(500).json({ error: "Error creando perfil de usuario" });
      }
    }

    console.log("✅ Login con Google exitoso");

    // ✅ Retornar respuesta igual que loginEmail y registrar
    return res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        nombre: perfil?.nombre || user.user_metadata?.full_name || user.email.split('@')[0],
        rol: perfil?.rol || "cliente",
        telefono: perfil?.telefono || null,
        fotoUrl: perfil?.foto_url || user.user_metadata?.avatar_url || null,
      },
    });

  } catch (err) {
    console.error("❌ Error en loginConGoogleToken:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};