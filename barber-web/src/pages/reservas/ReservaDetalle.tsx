import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  factura_url: string | null;
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

export default function ReservaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generandoFactura, setGenerandoFactura] = useState(false);
  
  // Estados para reagendar
  const [mostrarReagendar, setMostrarReagendar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [reagendando, setReagendando] = useState(false);

  const cargarReserva = async () => {
    try {
      const res = await api.get(`/reservas/${id}`);
      setReserva(res.data);
      setNuevaFecha(res.data.fecha);
      setNuevaHora(res.data.hora.substring(0, 5)); // "14:30:00" -> "14:30"
    } catch (err) {
      console.error("Error obteniendo reserva:", err);
      alert("No se pudo cargar la reserva");
      navigate("/reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReserva();
  }, [id]);

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!reserva) return;

    setUpdating(true);
    try {
      await api.put("/reservas/estado", {
        reserva_id: reserva.id,
        estado: nuevoEstado,
      });

      if (nuevoEstado === "completada" && !reserva.factura_url) {
        await generarFactura();
      } else {
        cargarReserva();
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert("No se pudo actualizar el estado");
    } finally {
      setUpdating(false);
    }
  };

  const reagendar = async () => {
    if (!reserva) return;

    if (!nuevaFecha || !nuevaHora) {
      alert("Debes seleccionar fecha y hora");
      return;
    }

    setReagendando(true);
    try {
      await api.put("/reservas/reagendar", {
        reserva_id: reserva.id,
        nueva_fecha: nuevaFecha,
        nueva_hora: nuevaHora + ":00", // Convertir "14:30" a "14:30:00"
      });

      alert("Reserva reagendada exitosamente");
      setMostrarReagendar(false);
      cargarReserva();
    } catch (err: any) {
      console.error("Error reagendando:", err);
      alert(err?.response?.data?.error || "No se pudo reagendar la reserva");
    } finally {
      setReagendando(false);
    }
  };

  const generarFactura = async () => {
    if (!reserva) return;

    setGenerandoFactura(true);
    try {
      const res = await api.post("/facturas", {
        reserva_id: reserva.id,
      });

      console.log("Factura generada:", res.data.url);
      alert("Factura generada exitosamente");
      cargarReserva();
    } catch (err) {
      console.error("Error generando factura:", err);
      alert("No se pudo generar la factura");
    } finally {
      setGenerandoFactura(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-CR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-500";
      case "aceptada":
        return "bg-blue-600";
      case "completada":
        return "bg-green-600";
      case "rechazada":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
          Reserva no encontrada
        </div>
        <button
          onClick={() => navigate("/reservas")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Volver a reservas
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/reservas")}
        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
      >
        ← Volver
      </button>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Detalle de Reserva</h1>
          <p className="text-blue-100 text-xs sm:text-sm">ID: {reserva.id}</p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* CLIENTE */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3">
              Cliente
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={reserva.usuarios.foto_url || "https://via.placeholder.com/80"}
                alt="Cliente"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-gray-200"
              />
              <div>
                <p className="font-semibold text-base sm:text-lg">{reserva.usuarios.nombre}</p>
                <p className="text-sm sm:text-base text-gray-600">{reserva.usuarios.email}</p>
              </div>
            </div>
          </div>

          {/* SERVICIO */}
          <div className="border-t pt-6">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3">
              Servicio
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-base sm:text-lg mb-2">
                {reserva.servicios.nombre}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    ₡{reserva.servicios.precio.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-500">Duración</p>
                  <p className="font-medium">{reserva.servicios.duracion} min</p>
                </div>
              </div>
            </div>
          </div>

          {/* FECHA Y HORA */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                Fecha y Hora
              </h2>
              
              {/* Botón Reagendar */}
              {(reserva.estado === "pendiente" || reserva.estado === "aceptada") && (
                <button
                  onClick={() => setMostrarReagendar(!mostrarReagendar)}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {mostrarReagendar ? "Cancelar" : "✏️ Reagendar"}
                </button>
              )}
            </div>

            {!mostrarReagendar ? (
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📅</span>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Fecha</p>
                    <p className="font-medium text-sm sm:text-base">{formatearFecha(reserva.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🕐</span>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Hora</p>
                    <p className="font-medium text-sm sm:text-base">{reserva.hora}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Fecha
                  </label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Hora
                  </label>
                  <input
                    type="time"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={reagendar}
                  disabled={reagendando}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
                >
                  {reagendando ? "Reagendando..." : "Confirmar Reagendar"}
                </button>
              </div>
            )}
          </div>

          {/* FACTURA */}
          {reserva.factura_url && (
            <div className="border-t pt-6">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3">
                Factura
              </h2>

              <a
                href={reserva.factura_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition font-medium text-sm"
              >
                📄 Descargar Factura PDF
              </a>
            </div>
          )}

          {/* ACCIONES */}
          <div className="border-t pt-6">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-3">
              Acciones
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {reserva.estado === "pendiente" && (
                <>
                  <button
                    disabled={updating}
                    onClick={() => cambiarEstado("aceptada")}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    Aceptar
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => cambiarEstado("rechazada")}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    Rechazar
                  </button>
                </>
              )}

              {reserva.estado === "aceptada" && (
                <>
                  <button
                    disabled={updating || generandoFactura}
                    onClick={() => cambiarEstado("completada")}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    {generandoFactura ? "Completando..." : "Marcar como Completada"}
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => cambiarEstado("rechazada")}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}