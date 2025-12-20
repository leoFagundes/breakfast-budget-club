"use client";

import { isLoggedIn } from "@/utils/auth";
import { deleteCookie } from "cookies-next";
import { ChevronRight, Home, KeyRound, LogIn, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function AccountContainer() {
  const [isOpen, setIsOpen] = useState(true);

  const isLogged = isLoggedIn();
  const router = useRouter();
  const pathname = usePathname();

  const distanceTop = pathname === "/admin/cards" ? "top-30" : "top-4";

  function toggleContainer() {
    setIsOpen(!isOpen);
  }

  function logout() {
    deleteCookie("admin_user");
    window.location.reload();
  }

  return (
    <div
      className={`flex items-center fixed ${distanceTop} ${
        isOpen ? "translate-x-0" : "translate-x-21"
      } right-0 rounded border border-gray-300 shadow-card transition-all duration-300 ease-in-out z-50 bg-white/50 backdrop-blur-2xl`}
    >
      <div
        onClick={() => toggleContainer()}
        className={`flex items-center justify-center bg-white h-30 w-5 cursor-pointer hover:bg-gray-100 `}
      >
        <ChevronRight
          className={`${
            isOpen ? "rotate-0" : "rotate-180"
          } transition-all duration-300 ease-in-out`}
        />
      </div>
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
            <KeyRound size={16} /> Admin
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
