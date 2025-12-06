import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  usuarios: {
    nombre: string;
    email: string;
    foto_url?: string;
  };
  servicios: {
    nombre: string;
    precio: number;
    duracion: number;
  };
}

export default function Reservas() {
  const navigate = useNavigate();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<string>("todas");

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setCargando(true);
    setError("");

    try {
      const res = await api.get("/reservas/barbero");
      setReservas(res.data);
      console.log("✅ Reservas cargadas:", res.data);
    } catch (err: any) {
      console.error("❌ Error cargando reservas:", err);
      setError("No se pudieron cargar las reservas");
    } finally {
      setCargando(false);
    }
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtro === "todas") return true;
    return reserva.estado === filtro;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "aceptada":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completada":
        return "bg-green-100 text-green-800 border-green-300";
      case "rechazada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-CR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (cargando) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mis Reservas</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {reservas.filter((r) => r.estado === "pendiente").length} Pendientes
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {reservas.filter((r) => r.estado === "aceptada").length} Aceptadas
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["todas", "pendiente", "aceptada", "completada", "rechazada"].map(
          (estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                filtro === estado
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Lista de reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            {filtro === "todas"
              ? "No tienes reservas todavía"
              : `No hay reservas ${filtro}s`}
          </h3>
          <p className="text-gray-500">
            Las reservas de tus clientes aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id}
              onClick={() => navigate(`/reservas/${reserva.id}`)}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Cliente */}
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={
                      reserva.usuarios.foto_url ||
                      "https://via.placeholder.com/50"
                    }
                    alt={reserva.usuarios.nombre}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {reserva.usuarios.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {reserva.usuarios.email}
                    </p>
                  </div>
                </div>

                {/* Servicio y precio */}
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {reserva.servicios.nombre}
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    ₡{reserva.servicios.precio.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reserva.servicios.duracion} min
                  </p>
                </div>
              </div>

              {/* Fecha, hora y estado */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <span>📅</span>
                    <span>{formatearFecha(reserva.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span>🕐</span>
                    <span>{reserva.hora}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                    reserva.estado
                  )}`}
                >
                  {reserva.estado.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador */}
      {reservasFiltradas.length > 0 && (
        <div className="mt-6 text-center text-gray-500 text-sm">
          Mostrando {reservasFiltradas.length} de {reservas.length} reserva
          {reservas.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}