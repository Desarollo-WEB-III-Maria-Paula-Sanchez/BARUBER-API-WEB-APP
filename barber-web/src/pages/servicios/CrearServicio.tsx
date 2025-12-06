import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function CrearServicio() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // 1️⃣ Crear el servicio primero (sin foto)
      const res = await api.post("/servicios", {
        nombre,
        descripcion,
        precio: Number(precio),
        duracion: Number(duracion),
        foto_url: null,
      });

      console.log("✅ Servicio creado:", res.data);

      // 2️⃣ Si hay foto, subirla después
      if (foto && res.data.id) {
        const formData = new FormData();
        formData.append("foto", foto);

        await api.post(`/servicios/${res.data.id}/imagen`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Foto del servicio subida");
      }

      navigate("/servicios");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "No se pudo crear el servicio";
      setError(errorMsg);
      console.error("❌ Error:", err?.response?.data || err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Crear Servicio</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 max-w-lg">
        <div>
          <label className="font-medium block mb-1">Nombre del servicio</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            placeholder="Ej: Corte clásico"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-medium block mb-1">Descripción</label>
          <textarea
            className="border rounded w-full p-2"
            rows={3}
            placeholder="Describe el servicio..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="font-medium block mb-1">Precio (₡)</label>
          <input
            type="number"
            className="border rounded w-full p-2"
            placeholder="5000"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="font-medium block mb-1">Duración (minutos)</label>
          <input
            type="number"
            className="border rounded w-full p-2"
            placeholder="30"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            required
            min="5"
            step="5"
          />
        </div>

        <div>
          <label className="font-medium block mb-1">Foto del servicio (opcional)</label>
          <input
            type="file"
            className="border rounded w-full p-2"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
          />
          {foto && (
            <p className="text-sm text-gray-600 mt-1">
              📎 {foto.name}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {cargando ? "Guardando..." : "Crear Servicio"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/servicios")}
            className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}