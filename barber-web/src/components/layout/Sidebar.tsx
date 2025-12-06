import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (path: string) =>
    `block px-5 py-3 rounded-md mb-1 ${
      pathname === path ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Botón hamburguesa (solo móvil) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay (solo móvil cuando está abierto) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-screen
          w-64
          bg-white shadow-md
          p-4
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">BARBER PANEL</h2>
          
          {/* Botón cerrar (solo móvil) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links de navegación */}
        <nav>
          <Link className={linkClass("/dashboard")} to="/dashboard" onClick={closeSidebar}>
            Dashboard
          </Link>
          <Link className={linkClass("/servicios")} to="/servicios" onClick={closeSidebar}>
            Servicios
          </Link>
          <Link className={linkClass("/reservas")} to="/reservas" onClick={closeSidebar}>
            Reservas
          </Link>
          <Link className={linkClass("/horarios")} to="/horarios" onClick={closeSidebar}>
            Horarios
          </Link>
          <Link className={linkClass("/perfil")} to="/perfil" onClick={closeSidebar}>
            Perfil
          </Link>
        </nav>
      </aside>
    </>
  );
}