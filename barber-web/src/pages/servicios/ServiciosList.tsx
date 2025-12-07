import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../store/auth";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  foto_url: string | null;
  created_at: string;
}

export default function ServiciosList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarServicios();
  }, [user]);

  const cargarServicios = async () => {
    if (!user?.id) return;

    setCargando(true);
    setError("");

    try {
      const res = await api.get(`/servicios/barbero/${user.id}`);
      setServicios(res.data);
      console.log("✅ Servicios cargados:", res.data);
    } catch (err: any) {
      console.error("❌ Error cargando servicios:", err);
      setError("No se pudieron cargar los servicios");
    } finally {
      setCargando(false);
    }
  };

  const eliminarServicio = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      await api.delete(`/servicios/${id}`);
      setServicios(servicios.filter((s) => s.id !== id));
      console.log("✅ Servicio eliminado");
    } catch (err: any) {
      console.error("❌ Error eliminando servicio:", err);
      alert("No se pudo eliminar el servicio");
    }
  };

  if (cargando) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mis Servicios</h1>
        <button
          onClick={() => navigate("/servicios/crear")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Crear Servicio
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      {/* Lista de servicios */}
      {servicios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">💈</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No tienes servicios todavía
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer servicio para que los clientes puedan reservar
          </p>
          <button
            onClick={() => navigate("/servicios/crear")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Crear primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Imagen */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {servicio.foto_url ? (
                  <img
                    src={servicio.foto_url}
                    alt={servicio.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">💈</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{servicio.nombre}</h3>

                {servicio.descripcion && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {servicio.descripcion}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      ₡{servicio.precio.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Duración</p>
                    <p className="font-medium">{servicio.duracion} min</p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/servicios/editar/${servicio.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarServicio(servicio.id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info adicional */}
      {servicios.length > 0 && (
        <div className="mt-6 text-center text-gray-500 text-sm">
          Tienes {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}{" "}
          registrado{servicios.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}