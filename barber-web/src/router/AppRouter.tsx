import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login/Login";
import Register from "../pages/login/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

import ServiciosList from "../pages/servicios/ServiciosList";
import CrearServicio from "../pages/servicios/CrearServicio";
import EditarServicio from "../pages/servicios/EditarServicio";

import Reservas from "../pages/reservas/Reservas";
import ReservaDetalle from "../pages/reservas/ReservaDetalle";

import Horarios from "../pages/horarios/Horarios";
import Perfil from "../pages/perfil/Perfil";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* LOGIN Y REGISTRO */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTEGIDO */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/servicios" element={<ServiciosList />} />
            <Route path="/servicios/crear" element={<CrearServicio />} />
            <Route path="/servicios/editar/:id" element={<EditarServicio />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/reservas/:id" element={<ReservaDetalle />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/perfil" element={<Perfil />} />

          </Route>
        </Route>

        {/* CUALQUIER OTRA RUTA → LOGIN */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}