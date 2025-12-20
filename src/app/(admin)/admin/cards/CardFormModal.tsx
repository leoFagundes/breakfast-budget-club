"use client";

import { useEffect, useState } from "react";
import CardRepository from "@/services/repositories/CardRepository";
import CategoryRepository from "@/services/repositories/CategoryRepository";

import { CardActionType, CardType, CategoryType } from "@/app/types";

import { Plus, X } from "lucide-react";
import { useAlert } from "@/app/context/alertContext";

export default function CardFormModal({
  card,
  onClose,
  onSaved,
}: {
  card: CardType | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(card?.title || "");
  const [categoryId, setCategoryId] = useState(card?.categoryId || "");
  const [actionLabel, setActionLabel] = useState(card?.actionLabel || "");
  const [actionType, setActionType] = useState<CardActionType>(
    card?.actionType || "external"
  );

  const [actionUrl, setActionUrl] = useState(card?.actionUrl || "");
  const [modalFileUrl, setModalFileUrl] = useState(card?.modalFileUrl || "");

  const [order, setOrder] = useState(card?.order ?? 0);

  // Categorias
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { showAlert } = useAlert();
  const isEditing = !!card;

  // Carrega categorias
  useEffect(() => {
    async function loadCategories() {
      const list = await CategoryRepository.getAll();
      setCategories(list);
    }
    loadCategories();
  }, []);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      showAlert("Nome da categoria inválido!", "error");
      return;
    }

    const nextOrder = categories.length + 1;

    const success = await CategoryRepository.create({
      name: newCategoryName.trim(),
      order: nextOrder,
      createdAt: new Date().toISOString(),
    });

    if (!success) {
      showAlert("Erro ao criar categoria.", "error");
      return;
    }

    const updated = await CategoryRepository.getAll();
    setCategories(updated);

    const created = updated.find((c) => c.name === newCategoryName.trim());
    if (created) {
      setCategoryId(created.id);
    }

    setNewCategoryName("");
    setCreateModalOpen(false);

    showAlert("Categoria criada!", "success");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return showAlert("O título é obrigatório", "error");

    if (!categoryId.trim())
      return showAlert("A categoria é obrigatória", "error");

    if (!actionLabel.trim())
      return showAlert("O texto do botão é obrigatório", "error");

    if (actionType === "external" && !actionUrl.trim()) {
      return showAlert("Informe o link externo", "error");
    }

    if (actionType === "modal" && !modalFileUrl.trim()) {
      return showAlert("Informe o arquivo do modal", "error");
    }

    const payload = {
      title,
      categoryId,
      actionLabel,
      actionType,
      actionUrl: actionType === "external" ? actionUrl : "",
      modalFileUrl: actionType === "modal" ? modalFileUrl : "",
      order,
      createdAt: card?.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      await CardRepository.update(card.id, payload);
      showAlert("Card atualizado!", "success");
    } else {
      await CardRepository.create(payload);
      showAlert("Card criado!", "success");
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl max-h-[90%] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Editar Card" : "Novo Card"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* TÍTULO */}
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="block text-sm font-medium">Categoria</label>

            <div className="flex gap-2 mt-1">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="px-3  text-white rounded-md bg-hbl-green hover:bg-hbl-green/80 transition cursor-pointer"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* TEXTO DO BOTÃO */}
          <div>
            <label className="block text-sm font-medium">Texto do botão</label>
            <input
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 border rounded p-4 border-dashed shadow-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={actionType === "external"}
                onChange={() => setActionType("external")}
              />
              Abrir página externa
            </label>
            {actionType === "external" && (
              <div>
                <label className="block text-sm font-medium">
                  Link externo
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md p-2 mt-1"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={actionType === "internal"}
                onChange={() => setActionType("internal")}
              />
              Abrir página interna
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={actionType === "modal"}
                onChange={() => setActionType("modal")}
              />
              Abrir modal
            </label>
            {actionType === "modal" && (
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">
                  Arquivo do modal (Embed)
                </label>

                <input
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={modalFileUrl}
                  onChange={(e) => setModalFileUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  required
                />

                <div className="text-xs bg-gray-50 border border-dashed rounded-md p-3 text-gray-600">
                  <p className="font-semibold mb-1">
                    Como pegar o embed de um vídeo do YouTube:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra o vídeo no YouTube</li>
                    <li>
                      Clique em <b>Compartilhar</b>
                    </li>
                    <li>
                      Clique em <b>Incorporar</b>
                    </li>
                    <li>
                      Copie apenas o link que começa com{" "}
                      <b>https://www.youtube.com/embed/</b>
                    </li>
                  </ol>
                  <p className="mt-2 italic">Não use link normal do YouTube.</p>
                </div>
              </div>
            )}
          </div>

          {/* ORDEM */}
          <div>
            <label className="block text-sm font-medium">Ordem</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
            <span className="text-xs italic opacity-80">
              Prioridade: menor {">"} maior
            </span>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="text-white mt-3 py-2 rounded-md bg-hbl-green hover:bg-hbl-green/80 cursor-pointer transition"
          >
            {isEditing ? "Salvar" : "Criar"}
          </button>
        </form>
      </div>

      {/* MODAL DE CRIAR CATEGORIA */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-sm relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setCreateModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-3">Nova Categoria</h3>

            <input
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <button
              onClick={handleCreateCategory}
              className="w-full mt-4 text-white py-2 rounded-md bg-hbl-green hover:bg-hbl-green/80 transition cursor-pointer"
            >
              Criar Categoria
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
