"use client";

import { useEffect, useState } from "react";
import UserRepository from "@/services/repositories/UserRepository";
import { UserType } from "@/app/types";
import { Trash2, Loader2 } from "lucide-react";
import { getCookie } from "cookies-next";

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  async function load() {
    setLoading(true);

    const id = getCookie("admin_user") as string;
    const me = await UserRepository.getById(id);
    setCurrentUser(me || null);

    const list = await UserRepository.getAll();
    setUsers(list);

    setLoading(false);
  }

  async function changeRole(id: string, role: UserType["role"]) {
    if (currentUser?.role !== "owner") return;
    await UserRepository.updateRole(id, role);
    load();
  }

  async function remove(id: string) {
    if (currentUser?.role !== "owner") return;
    await UserRepository.delete(id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" />
        Carregando usuários...
      </div>
    );

  const isOwner = currentUser?.role === "owner";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-hbl-green">
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Cargo</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>

                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={!isOwner}
                    onChange={(e) =>
                      changeRole(u.id, e.target.value as UserType["role"])
                    }
                    className={`border rounded py-1 px-2 cursor-pointer ${
                      !isOwner ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </td>

                <td className="p-3 flex items-center gap-2">
                  <button
                    disabled={!isOwner}
                    onClick={() => remove(u.id)}
                    className={`text-red-600 hover:text-red-800 cursor-pointer ${
                      !isOwner ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
