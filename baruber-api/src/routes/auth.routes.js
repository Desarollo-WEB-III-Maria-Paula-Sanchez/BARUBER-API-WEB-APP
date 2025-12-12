import express from "express";
import {
  loginEmail,
  loginGoogleCliente,        // ✅ Para web
  googleCallbackCliente,     // ✅ Callback web
  registrar,
  refrescarToken,
  obtenerSesion,
  registrarBarbero,
  loginGoogleBarbero,
  googleCallbackBarbero,
  loginConGoogleToken,       // ✅ Para app móvil Android
} from "../controllers/auth.controller.js";

import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

/* ============================================================
    LOGIN Y REGISTRO POR EMAIL
============================================================ */
router.post("/login", loginEmail);
router.post("/registro", registrar);
router.post("/registro-barbero", registrarBarbero);

/* ============================================================
    LOGIN GOOGLE CLIENTE (Web)
============================================================ */
router.get("/google-cliente", loginGoogleCliente);
router.get("/google-cliente/callback", googleCallbackCliente);

/* ============================================================
    ✅ NUEVO: LOGIN GOOGLE DESDE APP MÓVIL
    La app Android envía el ID Token de Google aquí
============================================================ */
router.post("/google-token", loginConGoogleToken);

/* ============================================================
    LOGIN GOOGLE BARBERO (Web dashboard)
============================================================ */
router.get("/google-barbero", loginGoogleBarbero);
router.get("/google-barbero/callback", googleCallbackBarbero);

/* ============================================================
    TOKENS
============================================================ */
router.post("/refresh", refrescarToken);

/* ============================================================
    SESIÓN DEL USUARIO
============================================================ */
router.get("/me", verificarToken, obtenerSesion);

export default router;