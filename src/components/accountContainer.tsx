"use client";

import { isLoggedIn } from "@/utils/auth";
import { deleteCookie } from "cookies-next";
import { Home, KeyRound, LogIn, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function AccountContainer() {
  const isLogged = isLoggedIn();
  const router = useRouter();
  const pathname = usePathname();

  const distanceTop = pathname === "/admin/cards" ? "top-30" : "top-4";

  function logout() {
    deleteCookie("admin_user");
    window.location.reload();
  }

  return (
    <div
      className={`fixed ${distanceTop} right-4 rounded border border-gray-300 shadow-card z-50 bg-white/50 backdrop-blur-2xl`}
    >
      {isLogged ? (
        <div className="flex flex-col items-start">
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-black cursor-pointer hover:bg-hbl-green hover:text-white transition-all duration-200 p-2 w-full"
          >
            <Home size={16} /> Início
          </div>

          <div
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-black cursor-pointer hover:bg-hbl-green hover:text-white transition-all duration-200 p-2 w-full"
          >
            <KeyRound size={16} /> Dashboard
          </div>

          <div
            onClick={logout}
            className="flex items-center gap-2 text-black cursor-pointer hover:bg-hbl-green hover:text-white transition-all duration-200 p-2 w-full"
          >
            <LogOut size={16} /> Sair
          </div>
        </div>
      ) : (
        <div
          onClick={() => router.push("/login")}
          className="hidden items-center gap-2 text-black cursor-pointer hover:bg-hbl-green hover:text-white transition-all duration-200 p-2 w-full"
        >
          <LogIn size={16} /> Entrar
        </div>
      )}
    </div>
  );
}
