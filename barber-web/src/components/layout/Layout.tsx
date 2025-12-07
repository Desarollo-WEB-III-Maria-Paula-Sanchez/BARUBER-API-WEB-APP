import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      
      <Sidebar />

      <div className="flex flex-col flex-1 w-full lg:w-auto">
        <Header />
        <main className="p-4 sm:p-6 overflow-y-auto bg-gray-100 h-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
}