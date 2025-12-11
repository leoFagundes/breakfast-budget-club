/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import CardRepository from "@/services/repositories/CardRepository";
import CardFilesRepository from "@/services/repositories/CardFilesRepository";
import CardFileUploader from "@/app/(admin)/admin/cards/CardFileUploader";
import { isLoggedIn } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash, Undo } from "lucide-react";
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
    async function loadUser() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const user = await UserRepository.getById(uid);
      setCurrentUser(user);
    }

    loadUser();
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
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-2">
      <div className="bg-white p-2 rounded-xl">
        <div className="flex items-center gap-2">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />

          <h1 className="text-3xl font-bold text-gray-800">{card.title}</h1>
        </div>

        {logged && currentUser && !isGuest && (
          <div className="flex flex-col gap-2 border p-4 rounded border-dashed border-hbl-green mt-6 max-w-100">
            <span className="font-semibold text-hbl-green">
              Área visível apenas para usuários administradores
            </span>

            <CardFileUploader cardId={id} onUploaded={load} />
          </div>
        )}
        {logged && isGuest && (
          <div className="flex flex-col gap-2 border p-4 rounded border-gray-400 mt-6">
            <span className="font-semibold text-gray-500">
              Sua conta não tem permissão — envio de arquivos desabilitado.
            </span>
          </div>
        )}
      </div>

      <div className="bg-white p-2">
        {files.length === 0 ? (
          <p className="text-gray-500 mt-3">Nenhum arquivo enviado.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="p-4 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition shadow-sm flex flex-col gap-3"
                >
                  <span>{file.name}</span>
                  {/* PREVIEW */}
                  {isImage && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-100 object-cover rounded-md border"
                    />
                  )}
                  {isPDF && (
                    <iframe
                      src={file.url}
                      className="w-full h-100 rounded-md border"
                    ></iframe>
                  )}
                  {isVideo && (
                    <video
                      src={file.url}
                      controls
                      className="w-full h-100 rounded-md border object-cover"
                    />
                  )}
                  {isAudio && (
                    <audio controls className="w-full">
                      <source src={file.url} />
                    </audio>
                  )}
                  {!isImage && !isPDF && !isVideo && !isAudio && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                        📄
                      </div>
                      <span className="text-gray-700">{file.name}</span>
                    </div>
                  )}
                  {/* Botões */}
                  <div className="flex justify-between items-center mt-2">
                    <a
                      href={file.url}
                      target="_blank"
                      className="text-hbl-green font-medium underline"
                    >
                      Abrir arquivo
                    </a>

                    {/* Botão EXCLUIR – só aparece para admins */}
                    {logged && !isGuest && (
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              "Tem certeza que deseja excluir este arquivo?"
                            )
                          )
                            return;

                          await CardFilesRepository.delete(id, file);
                          load(); // recarrega lista
                        }}
                        className="px-3 py-1 text-red-600 bg-red-100 hover:bg-red-200 rounded-md cursor-pointer"
                      >
                        <Trash size={16} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
