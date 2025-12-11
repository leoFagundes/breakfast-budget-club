/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import CardFilesRepository from "@/services/repositories/CardFilesRepository";
import Loader from "@/components/loader";

export default function CardFileUploader({ cardId, onUploaded }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setUploading(true);

    try {
      await CardFilesRepository.uploadFile(cardId, file);

      setFile(null); // limpa seleção
      onUploaded(); // atualiza lista
    } catch (error) {
      alert("Erro ao enviar o arquivo. Veja o console.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Enviar arquivo (PDF, Imagem, Vídeo, ZIP...)
      </label>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="border p-2 rounded-md cursor-pointer bg-white"
      />

      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="bg-primary-green text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-600 transition w-fit"
        >
          Enviar arquivo
        </button>
      )}

      {uploading && (
        <div className="text-primary-green flex items-center gap-2 mt-1">
          <Loader /> Enviando arquivo...
        </div>
      )}
    </div>
  );
}
