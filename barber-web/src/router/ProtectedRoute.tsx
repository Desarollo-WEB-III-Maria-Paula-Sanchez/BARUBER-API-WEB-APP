import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useEffect, useState } from "react";
import api from "../api/axios";

export function ProtectedRoute() {
  const { token, logout, setToken, setUser, isHydrated } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  const location = useLocation();

  /* ========================================================
      1) CATCH TOKEN FROM GOOGLE REDIRECT 
     ======================================================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let googleToken = params.get("access_token");

    if (!googleToken && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      googleToken = hashParams.get("access_token");
    }

    if (googleToken) {
      console.log("✅ Token capturado desde Google OAuth");
      setToken(googleToken);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location, setToken]);

  /* ========================================================
      2) Authenticate token with backend (/auth/me)
     ======================================================== */
  useEffect(() => {
    const verify = async () => {
      if (!isHydrated) return;

      if (!token) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");

        if (res.data.user?.rol === "barbero") {
          setUser(res.data.user); // 👈 Guardar usuario
          setAllowed(true);
        } else {
          console.warn("❌ Usuario no es barbero");
          logout();
          setAllowed(false);
        }
      } catch (error) {
        console.error("❌ Error validando token:", error);
        logout();
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [token, isHydrated, logout, setUser]);

  if (!isHydrated || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return allowed ? <Outlet /> : <Navigate to="/login" replace />;
}