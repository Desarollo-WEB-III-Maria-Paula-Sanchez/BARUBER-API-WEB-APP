import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import horariosRoutes from "./routes/horarios.routes.js";
import facturasRoutes from "./routes/facturas.routes.js";

import { errorHandler } from "./middlewares/error.js";
import barberosRoutes from "./routes/barberos.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

// Ruta test
app.get("/", (req, res) => {
  res.send("BARUBER API ✔ Activa");
});

// Registrar rutas
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/servicios", serviciosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/horarios", horariosRoutes);
app.use("/facturas", facturasRoutes);
app.use("/api/barberos", barberosRoutes);

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🔥 BARUBER API corriendo en puerto ${PORT}`)
);
