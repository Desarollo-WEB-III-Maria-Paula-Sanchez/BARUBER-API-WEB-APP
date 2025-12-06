import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../store/auth";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  foto_url: string | null;
  rol: string;
}

export default function Perfil() {
  const { token } = useAuth();
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPerfil();
  }, [token]);

  const cargarPerfil = async () => {
    try {
      const res = await api.get("/usuarios/perfil");
      setUsuario(res.data);
      setNombre(res.data.nombre || "");
      setTelefono(res.data.telefono || "");
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      const res = await api.put("/usuarios/perfil", {
        nombre,
        telefono,
        foto_url: usuario?.foto_url
      });

      setUsuario(res.data);
      setMensaje("✅ Perfil actualizado exitosamente");
      
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError("No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    setSubiendoFoto(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/usuarios/perfil/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Actualizar la URL de la foto en el estado
      setUsuario((prev) => prev ? { ...prev, foto_url: res.data.url } : null);
      setMensaje("✅ Foto actualizada exitosamente");
      
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setError("No se pudo subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
          No se pudo cargar el perfil
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Mi Perfil</h1>

      {/* Mensajes */}
      {mensaje && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 border border-green-300">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-300">
          {error}
        </div>
      )}

      {/* Foto de perfil */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Foto de perfil</h2>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={usuario.foto_url || "https://via.placeholder.com/120"}
              alt="Perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
            
            {subiendoFoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="foto-input"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium"
            >
              {subiendoFoto ? "Subiendo..." : "Cambiar foto"}
            </label>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              onChange={cambiarFoto}
              disabled={subiendoFoto}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG o GIF. Máximo 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Información básica */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Información básica</h2>
        
        <form onSubmit={actualizarPerfil} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={usuario.email}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              El email no se puede modificar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: +506 8888-8888"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <input
              type="text"
              value={usuario.rol}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed capitalize"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      {/* Información de la cuenta */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información de la cuenta</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID de usuario:</span>
            <span className="font-mono text-gray-800">{usuario.id.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de cuenta:</span>
            <span className="capitalize font-medium text-gray-800">{usuario.rol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}