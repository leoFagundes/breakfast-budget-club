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
      const raw = getCookie("admin_user");

      if (!raw || typeof raw !== "string") {
        setLoading(false);
        return;
      }

      let parsed: { id: string } | null = null;

      try {
        parsed = JSON.parse(raw);
      } catch {
        setLoading(false);
        return;
      }

      if (!parsed?.id) {
        setLoading(false);
        return;
      }

      const userFromDB = await UserRepository.getById(parsed.id);
      setUser(userFromDB);
      setLoading(false);

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
