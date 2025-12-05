import express from "express";
import { loginEmail, loginGoogle, registrar, refrescarToken, obtenerSesion } from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginEmail);
router.get("/google", loginGoogle);
router.post("/registro", registrar);
router.post("/refresh", refrescarToken);
router.get("/me", verificarToken, obtenerSesion);

export default router;
