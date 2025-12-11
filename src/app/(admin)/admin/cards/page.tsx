"use client";

import { useEffect, useState } from "react";
import CardRepository from "@/services/repositories/CardRepository";
import CategoryRepository from "@/services/repositories/CategoryRepository";
import { CardType, CategoryType } from "@/app/types";
import { Plus, Pencil, Trash } from "lucide-react";
import { useAlert } from "@/app/context/alertContext";
import CardFormModal from "./CardFormModal";

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const { showAlert } = useAlert();

  async function loadCards() {
    setLoading(true);
    const list = await CardRepository.getAll();
    setCards(list);
    setLoading(false);
  }

  async function loadCategories() {
    const list = await CategoryRepository.getAll();
    setCategories(list);
  }

  useEffect(() => {
    loadCards();
    loadCategories();
  }, []);

  function openCreate() {
    setEditingCard(null);
    setModalOpen(true);
  }

  function openEdit(card: CardType) {
    setEditingCard(card);
    setModalOpen(true);
  }

  async function deleteCard(id: string) {
    if (!confirm("Tem certeza que deseja excluir este card?")) return;

    await CardRepository.delete(id);
    showAlert("Card deletado!", "success");
    loadCards();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Cards</h1>

        <button
          onClick={openCreate}
          className="flex items-center gap-2  text-white px-4 py-2 rounded-md cursor-pointer bg-hbl-green hover:bg-hbl-green/80 transition"
        >
          <Plus size={18} /> Novo Card
        </button>
      </div>

      {/* Listagem */}
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : cards.length === 0 ? (
        <p className="text-gray-500">Nenhum card encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h2 className="font-semibold text-lg">{card.title}</h2>

              {/* Em vez de description, exibe o actionLabel */}
              <p className="text-gray-600 text-sm mt-1">{card.actionLabel}</p>

              {/* Categoria */}
              <p className="text-xs text-gray-500 mt-1">
                Categoria:{" "}
                {categories.find((c) => c.id === card.categoryId)?.name ??
                  "Sem categoria"}
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => openEdit(card)}
                  className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer"
                >
                  <Pencil size={16} className="text-blue-600" />
                </button>

                <button
                  onClick={() => deleteCard(card.id)}
                  className="p-2 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer"
                >
                  <Trash size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CardFormModal
          card={editingCard}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadCards();
          }}
        />
      )}
    </div>
  );
}
