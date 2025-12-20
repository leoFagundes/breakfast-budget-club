/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import CardFilesRepository from "@/services/repositories/CardFilesRepository";
import Loader from "@/components/loader";

export default function CardFileUploader({ cardId, onUploaded }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        await CardFilesRepository.uploadFile(cardId, file);
      }

      setFiles([]);
      onUploaded();
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar um ou mais arquivos.");
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
        multiple
        onChange={(e) => {
          const selected = e.target.files;
          if (!selected) return;
          setFiles(Array.from(selected));
        }}
        className="border p-2 rounded-md cursor-pointer bg-white"
      />

      {files.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
          className="bg-primary-green text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-600 transition w-fit"
        >
          Enviar {files.length} arquivo(s)
        </button>
      )}

      {uploading && (
        <div className="text-primary-green flex items-center gap-2 mt-1">
          <Loader /> Enviando arquivo...
        </div>
      )}

      {files.length > 0 && !uploading && (
        <ul className="text-sm text-gray-600 list-disc ml-5">
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
