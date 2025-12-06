import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  foto_url: string | null;
}

export default function EditarServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos del servicio
  useEffect(() => {
    cargarServicio();
  }, [id]);

  // Preview de la foto cuando se selecciona una nueva
  useEffect(() => {
    if (foto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(foto);
    }
  }, [foto]);

  const cargarServicio = async () => {
    if (!id) return;

    setCargando(true);
    setError("");

    try {
      const res = await api.get(`/servicios/${id}`);
      const data = res.data;

      setServicio(data);
      setNombre(data.nombre);
      setDescripcion(data.descripcion || "");
      setPrecio(data.precio.toString());
      setDuracion(data.duracion.toString());
      setFotoPreview(data.foto_url);

      console.log("✅ Servicio cargado:", data);
    } catch (err: any) {
      console.error("❌ Error cargando servicio:", err);
      setError("No se pudo cargar el servicio");
    } finally {
      setCargando(false);
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      // 1️⃣ Actualizar datos del servicio
      await api.put(`/servicios/${id}`, {
        nombre,
        descripcion,
        precio: Number(precio),
        duracion: Number(duracion),
      });

      console.log("✅ Servicio actualizado");

      // 2️⃣ Si hay nueva foto, subirla
      if (foto) {
        setSubiendoFoto(true);
        const formData = new FormData();
        formData.append("foto", foto);

        await api.post(`/servicios/${id}/imagen`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Foto actualizada");
        setSubiendoFoto(false);
      }

      navigate("/servicios");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || "No se pudo actualizar el servicio";
      setError(errorMsg);
      console.error("❌ Error:", err?.response?.data || err);
    } finally {
      setGuardando(false);
      setSubiendoFoto(false);
    }
  };

  const handleEliminarFoto = () => {
    setFoto(null);
    setFotoPreview(servicio?.foto_url || null);
  };

  if (cargando) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
          No se encontró el servicio
        </div>
        <button
          onClick={() => navigate("/servicios")}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Volver a servicios
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/servicios")}
          className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold">Editar Servicio</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleActualizar} className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda - Datos */}
          <div className="space-y-4">
            <div>
              <label className="font-medium block mb-1">
                Nombre del servicio
              </label>
              <input
                type="text"
                className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Corte clásico"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-medium block mb-1">Descripción</label>
              <textarea
                className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe el servicio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="font-medium block mb-1">Precio (₡)</label>
              <input
                type="number"
                className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="font-medium block mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                required
                min="5"
                step="5"
              />
            </div>
          </div>

          {/* Columna derecha - Foto */}
          <div className="space-y-4">
            <div>
              <label className="font-medium block mb-2">Foto del servicio</label>

              {/* Preview de la foto */}
              <div className="mb-3">
                {fotoPreview ? (
                  <div className="relative">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                    {foto && (
                      <button
                        type="button"
                        onClick={handleEliminarFoto}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        title="Quitar foto nueva"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-6xl">💈</span>
                  </div>
                )}
              </div>

              {/* Input de archivo */}
              <input
                type="file"
                className="border rounded w-full p-2"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
              />

              {foto && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  ✓ Nueva foto seleccionada: {foto.name}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                La foto actual se reemplazará al guardar si seleccionas una nueva
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={guardando || subiendoFoto}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
          >
            {subiendoFoto
              ? "Subiendo foto..."
              : guardando
              ? "Guardando..."
              : "Guardar Cambios"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/servicios")}
            disabled={guardando || subiendoFoto}
            className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition disabled:bg-gray-200 font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}