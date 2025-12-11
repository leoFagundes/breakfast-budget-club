"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import UserRepository from "@/services/repositories/UserRepository";
import { UserType } from "@/app/types";

export default function BlockGuest({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const cookie = getCookie("admin_user");
      if (!cookie) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(cookie as string) as { id: string };
        const userFromDB = await UserRepository.getById(parsed.id);

        setUser(userFromDB);
      } catch (err) {
        console.error("Erro ao carregar role do usuário:", err);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) return null;

  if (user?.role === "guest") {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-md shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso restrito</h1>
          <p className="text-gray-700">
            Esta área é exclusiva para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
