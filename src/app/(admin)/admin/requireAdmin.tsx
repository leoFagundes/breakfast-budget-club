"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useAlert } from "@/app/context/alertContext";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    const cookie = getCookie("admin_user");

    if (!cookie) {
      showAlert(
        "Você precisa estar logado para acessar essa página",
        "warning"
      );
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Verificando acesso...
      </div>
    );
  }

  return <>{children}</>;
}
