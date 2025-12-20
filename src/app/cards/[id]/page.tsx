/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import CardRepository from "@/services/repositories/CardRepository";
import CardFilesRepository from "@/services/repositories/CardFilesRepository";
import CardFileUploader from "@/app/(admin)/admin/cards/CardFileUploader";
import { isLoggedIn } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";
import { UserType } from "@/app/types";
import { auth } from "@/services/firebaseConfig";
import UserRepository from "@/services/repositories/UserRepository";

export default function CardPage({ params }: any) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const { id } = use(params) as { id: string };

  const route = useRouter();

  const logged = isLoggedIn();

  const [card, setCard] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const c = await CardRepository.getById(id);
    const f = await CardFilesRepository.list(id);

    setCard(c);
    setFiles(f);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null);
        return;
      }

      const loadedUser = await UserRepository.getById(user.uid);
      setCurrentUser(loadedUser);
    });

    return () => unsub();
  }, []);

  const isGuest = currentUser?.role === "guest";
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "owner";

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Carregando...
      </div>
    );

  if (!card)
    return (
      <div className="flex justify-center items-center h-40 text-red-500">
        Card não encontrado.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      <header className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => route.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft />
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {card.title}
          </h1>

          {isAdmin && (
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-hbl-green/10 text-hbl-green font-semibold">
              ADMIN
            </span>
          )}
        </div>

        {logged && currentUser && !isGuest && (
          <div className="border border-dashed border-hbl-green rounded-lg p-4 bg-hbl-green/5">
            <p className="text-sm font-semibold text-hbl-green mb-3">
              Área administrativa
            </p>
            <CardFileUploader cardId={id} onUploaded={load} />
          </div>
        )}

        {logged && isGuest && (
          <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-500">
            Sua conta não possui permissão para envio de arquivos.
          </div>
        )}
      </header>

      <section className="bg-white rounded-xl shadow-sm p-5">
        {files.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum arquivo enviado ainda.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {files.map((file) => {
              const lower = file.name.toLowerCase();

              const isImage =
                lower.endsWith(".jpg") ||
                lower.endsWith(".jpeg") ||
                lower.endsWith(".png") ||
                lower.endsWith(".gif") ||
                lower.endsWith(".webp");

              const isPDF = lower.endsWith(".pdf");
              const isVideo =
                lower.endsWith(".mp4") ||
                lower.endsWith(".mov") ||
                lower.endsWith(".avi") ||
                lower.endsWith(".mkv");

              const isAudio =
                lower.endsWith(".mp3") ||
                lower.endsWith(".wav") ||
                lower.endsWith(".ogg");

              return (
                <li
                  key={file.id}
                  className="rounded-lg border bg-gray-50 hover:shadow-md transition flex flex-col overflow-hidden"
                >
                  <div className="p-3 font-medium text-sm truncate">
                    {file.name}
                  </div>

                  <div className="h-44 bg-black/5 flex items-center justify-center">
                    {isImage && (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {isPDF && (
                      <iframe src={file.url} className="w-full h-full" />
                    )}

                    {isVideo && (
                      <video
                        src={file.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}

                    {isAudio && (
                      <audio controls className="w-full px-3">
                        <source src={file.url} />
                      </audio>
                    )}

                    {!isImage && !isPDF && !isVideo && !isAudio && (
                      <div className="text-4xl">📄</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border-t">
                    <a
                      href={file.url}
                      target="_blank"
                      className="text-sm text-hbl-green font-semibold hover:underline"
                    >
                      Abrir
                    </a>

                    {logged && !isGuest && (
                      <button
                        onClick={async () => {
                          if (!confirm("Deseja excluir este arquivo?")) return;
                          await CardFilesRepository.delete(id, file);
                          load();
                        }}
                        className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
