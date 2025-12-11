"use client";

import { useEffect, useState } from "react";
import CardRepository from "@/services/repositories/CardRepository";
import CategoryRepository from "@/services/repositories/CategoryRepository";

import { CardType, CategoryType } from "@/app/types";

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
  const [actionUrl, setActionUrl] = useState(card?.actionUrl || "");
  const [internalPage, setInternalPage] = useState(card?.internalPage || false);
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

    if (!internalPage && !actionUrl.trim()) {
      return showAlert(
        "Como o link interno está desabilitado, você precisa informar um link externo.",
        "warning"
      );
    }

    const payload = {
      title,
      categoryId,
      actionLabel,
      actionUrl: actionUrl || "",
      internalPage,
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
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

          {/* LINK EXTERNO */}
          <div>
            <label className="block text-sm font-medium">
              Link externo (opcional)
            </label>
            <input
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* PÁGINA INTERNA */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={internalPage}
              onChange={() => setInternalPage(!internalPage)}
            />
            Abrir página interna
          </label>

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
