import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../store/auth";
import { Link } from "react-router-dom";

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  usuarios: { nombre: string };
  servicios: { nombre: string; precio: number };
}

interface Servicio {
  id: string;
  nombre: string;
}

export default function Dashboard() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  const cargarDatos = async () => {
    try {
      // Obtener sesión (para sacar ID del barbero)
      const me = await api.get("/auth/me");
      const barberId = me.data.user.id;

      // Cargar reservas del barbero
      const resReservas = await api.get("/reservas/barbero");
      setReservas(resReservas.data);

      // Cargar servicios del barbero
      const resServicios = await api.get(`/servicios/${barberId}`);
      setServicios(resServicios.data);

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  // ==============================
  // MÉTRICAS
  // ==============================
  const hoy = new Date().toISOString().split("T")[0];

  const reservasHoy = reservas.filter((r) => r.fecha === hoy);
  const pendientesHoy = reservasHoy.filter((r) => r.estado === "pendiente");
  const aceptadasHoy = reservasHoy.filter((r) => r.estado === "aceptada");

  // Próxima reserva (solo aceptadas y pendientes)
  const proxima = reservas
    .filter((r) => r.estado === "pendiente" || r.estado === "aceptada")
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.fecha}T${a.hora}`);
      const dateTimeB = new Date(`${b.fecha}T${b.hora}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    })[0];

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-CR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard del Barbero</h1>

      {/* =====================================
          TARJETAS DE ESTADÍSTICAS
      ===================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white shadow-md p-6 rounded-lg border-l-4 border-blue-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Reservas hoy</p>
          <h3 className="text-3xl font-bold text-gray-800">{reservasHoy.length}</h3>
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm font-medium mb-1">Pendientes hoy</p>
          <h3 className="text-3xl font-bold text-gray-800">{pendientesHoy.length}</h3>
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg border-l-4 border-green-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Aceptadas hoy</p>
          <h3 className="text-3xl font-bold text-gray-800">{aceptadasHoy.length}</h3>
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg border-l-4 border-purple-600">
          <p className="text-gray-500 text-sm font-medium mb-1">Servicios</p>
          <h3 className="text-3xl font-bold text-gray-800">{servicios.length}</h3>
        </div>
      </div>

      {/* =====================================
          PRÓXIMA RESERVA
      ===================================== */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">📅 Próxima reserva</h2>

        {proxima ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Cliente:</span>
              <span className="text-gray-900">{proxima.usuarios.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Servicio:</span>
              <span className="text-gray-900">{proxima.servicios.nombre}</span>
              <span className="text-blue-600 font-semibold">
                ₡{proxima.servicios.precio.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Fecha:</span>
              <span className="text-gray-900">{formatearFecha(proxima.fecha)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Hora:</span>
              <span className="text-gray-900">{proxima.hora}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                proxima.estado === "pendiente" 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {proxima.estado.toUpperCase()}
              </span>
            </div>
            
            <div className="pt-3">
              <Link
                to={`/reservas/${proxima.id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No hay reservas próximas.</p>
        )}
      </div>

      {/* =====================================
          RESUMEN DE TODAS LAS RESERVAS
      ===================================== */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 Resumen general</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">
              {reservas.filter(r => r.estado === "pendiente").length}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {reservas.filter(r => r.estado === "aceptada").length}
            </p>
            <p className="text-sm text-gray-600">Aceptadas</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {reservas.filter(r => r.estado === "completada").length}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">
              {reservas.filter(r => r.estado === "rechazada").length}
            </p>
            <p className="text-sm text-gray-600">Rechazadas</p>
          </div>
        </div>
      </div>

      {/* =====================================
          ACCESOS RÁPIDOS
      ===================================== */}
      <h2 className="text-xl font-semibold mb-4">⚡ Accesos rápidos</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <Link
          to="/servicios/crear"
          className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center hover:bg-blue-700 shadow-md transition font-medium"
        >
          ➕ Crear servicio
        </Link>

        <Link
          to="/reservas"
          className="bg-gray-800 text-white px-4 py-3 rounded-lg text-center hover:bg-black shadow-md transition font-medium"
        >
          📋 Ver reservas
        </Link>

        <Link
          to="/horarios"
          className="bg-green-600 text-white px-4 py-3 rounded-lg text-center hover:bg-green-700 shadow-md transition font-medium"
        >
          🕐 Ajustar horarios
        </Link>

        <Link
          to="/perfil"
          className="bg-gray-500 text-white px-4 py-3 rounded-lg text-center hover:bg-gray-600 shadow-md transition font-medium"
        >
          👤 Editar perfil
        </Link>

      </div>

    </div>
  );
}