import { useAuth } from "../../store/auth";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between lg:justify-end items-center">
      {/* Espaciador para el botón hamburguesa en móvil */}
      <div className="w-10 lg:hidden"></div>
      
      {/* Título en móvil (opcional) */}
      <h1 className="lg:hidden text-lg font-semibold text-gray-800">BARUBER</h1>
      
      <button
        className="text-red-500 hover:text-red-700 font-medium text-sm sm:text-base transition"
        onClick={logout}
      >
        Cerrar sesión
      </button>
    </header>
  );
}