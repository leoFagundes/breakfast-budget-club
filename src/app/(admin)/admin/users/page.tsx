"use client";

import { useEffect, useState } from "react";
import UserRepository from "@/services/repositories/UserRepository";
import { UserType } from "@/app/types";
import { Trash2, Loader2 } from "lucide-react";
import { getCookie } from "cookies-next";
import { auth } from "@/services/firebaseConfig";

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  async function load() {
    setLoading(true);

    const uid = auth.currentUser?.uid;
    const me = uid ? await UserRepository.getById(uid) : null;
    setCurrentUser(me || null);

    const list = await UserRepository.getAll();
    setUsers(list);

    setLoading(false);
  }

  async function changeRole(id: string, newRole: UserType["role"]) {
    if (!currentUser) return;

    const me = currentUser;
    const target = users.find((u) => u.id === id);
    if (!target) return;

    // OWNER pode tudo
    if (me.role === "owner") {
      await UserRepository.updateRole(id, newRole);
      return load();
    }

    // ADMIN só pode editar guests
    if (me.role === "admin") {
      if (target.role !== "guest") {
        alert("Admins só podem alterar usuários guest.");
        return;
      }

      // Admins não podem promover ninguém a owner
      if (newRole === "owner") {
        alert("Admins não podem definir usuários como owner.");
        return;
      }

      await UserRepository.updateRole(id, newRole);
      return load();
    }

    // Guest não pode alterar nada
    alert("Você não tem permissão para alterar usuários.");
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
            {users.map((u) => {
              const canEdit =
                currentUser?.role === "owner" ||
                (currentUser?.role === "admin" && u.role === "guest");

              const canDelete = currentUser?.role === "owner";

              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>

                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={!canEdit}
                      onChange={(e) =>
                        changeRole(u.id, e.target.value as UserType["role"])
                      }
                      className={`border rounded py-1 px-2 cursor-pointer ${
                        !canEdit ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="guest">Guest</option>
                    </select>
                  </td>

                  <td className="p-3 flex items-center gap-2">
                    <button
                      disabled={!canDelete}
                      onClick={() => remove(u.id)}
                      className={`text-red-600 hover:text-red-800 cursor-pointer ${
                        !canDelete ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
