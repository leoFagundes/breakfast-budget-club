"use client";

import { useState } from "react";
import { Menu, X, Users, Layers, LogOut, Blocks } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import RequireAdmin from "./requireAdmin";
import BlockGuest from "./BlockGuest";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    deleteCookie("admin_user");
    router.replace("/login");
  }

  return (
    <RequireAdmin>
      <BlockGuest>
        <div className="flex h-screen bg-gray-100">
          <aside
            className={clsx(
              "bg-white border-r border-gray-300 h-full transition-all duration-300 flex flex-col",
              open ? "w-64" : "w-16"
            )}
          >
            <div
              className={clsx(
                "flex items-center px-4 py-4 border-b border-gray-200 transition-all",
                open ? "justify-between" : "justify-center"
              )}
            >
              {open && (
                <span className="font-bold text-lg text-black">Admin</span>
              )}

              <button
                className="p-2 rounded-md hover:bg-gray-200 cursor-pointer text-black"
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X /> : <Menu />}
              </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 p-2 flex flex-col gap-2">
              <AdminLink
                href="/admin/cards"
                icon={<Layers size={20} />}
                label="Cards"
                open={open}
                active={pathname.startsWith("/admin/cards")}
              />

              <AdminLink
                href="/admin/users"
                icon={<Users size={20} />}
                label="Usuários"
                open={open}
                active={pathname.startsWith("/admin/users")}
              />

              <AdminLink
                href="/admin/categoriesOrder"
                icon={<Blocks size={20} />}
                label="Categorias"
                open={open}
                active={pathname.startsWith("/admin/categoriesOrder")}
              />

              <button
                onClick={logout}
                className={clsx(
                  "flex items-center gap-3 p-2 rounded-md text-red-600 hover:bg-red-100 cursor-pointer mt-auto",
                  open ? "justify-start" : "justify-center"
                )}
              >
                <LogOut size={20} />
                {open && <span>Sair</span>}
              </button>
            </nav>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </BlockGuest>
    </RequireAdmin>
  );
}

function AdminLink({
  href,
  icon,
  label,
  open,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition",
        open ? "justify-start" : "justify-center",
        active
          ? "bg-gray-200 font-semibold text-black"
          : "text-black hover:bg-gray-200"
      )}
    >
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
