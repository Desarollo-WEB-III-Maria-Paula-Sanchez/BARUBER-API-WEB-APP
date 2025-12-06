import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../store/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const { setToken } = useAuth();
  const navigate = useNavigate();

  /* ============================================================
      LOGIN NORMAL
  ============================================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;

      // Guardar token en Zustand + localStorage
      setToken(token);
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Credenciales incorrectas"
      );
    } finally {
      setCargando(false);
    }
  };

  /* ============================================================
      LOGIN CON GOOGLE
  ============================================================ */
  const loginGoogle = async () => {
    try {
      const res = await api.get("/auth/google-barbero");
      window.location.href = res.data.url;
    } catch {
      setError("No se pudo iniciar sesión con Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">BARUBER</h1>
          <p className="text-gray-500 mt-1">Panel para Barberos</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="barbero@baruber.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-gray-700 text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition shadow"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">ó</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={loginGoogle}
          className="w-full border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-gray-700 font-medium">Continuar con Google</span>
        </button>

        {/* Link to Register */}
        <div className="text-center mt-6 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link 
            to="/register" 
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
          >
            Regístrate aquí
          </Link>
        </div>

      </div>

    </div>
  );
}