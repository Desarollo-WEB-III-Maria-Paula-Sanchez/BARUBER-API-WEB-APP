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
