/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import CategoryRepository from "@/services/repositories/CategoryRepository";
import CardRepository from "@/services/repositories/CardRepository";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { GripVertical, Save, Check, Trash2, Plus } from "lucide-react";
import { CategoryType } from "@/app/types";
import { useAlert } from "@/app/context/alertContext";
import { IconMap, normalizeIconName } from "@/utils/icons";

export default function CategoryOrderManager() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  // criar categoria
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    async function load() {
      const list = await CategoryRepository.getAll();
      setCategories(list);
    }
    load();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function saveOrder() {
    setSavingOrder(true);
    try {
      await Promise.all(
        categories.map((cat, index) =>
          CategoryRepository.update(cat.id, { order: index + 1 })
        )
      );
      showAlert("Ordem salva com sucesso!", "success");
    } catch {
      showAlert("Erro ao salvar ordem.", "error");
    }
    setSavingOrder(false);
  }

  async function createCategory() {
    if (!newName.trim()) {
      showAlert("Nome inválido.", "error");
      return;
    }

    if (newIcon.trim()) {
      const normalized = normalizeIconName(newIcon.trim());

      if (!IconMap[normalized]) {
        showAlert(`Ícone "${newIcon}" não existe no Lucide.`, "error");
        return;
      }
    }

    const order = categories.length + 1;

    const success = await CategoryRepository.create({
      name: newName.trim(),
      iconName: newIcon.trim() || undefined,
      order,
      createdAt: new Date().toISOString(),
    });

    if (!success) return showAlert("Erro ao criar categoria.", "error");

    const updated = await CategoryRepository.getAll();
    setCategories(updated);
    setShowCreateModal(false);
    setNewName("");
    setNewIcon("");

    showAlert("Categoria criada!", "success");
  }

  const CreatePreviewIcon = IconMap[normalizeIconName(newIcon)];

  async function deleteCategory(id: string) {
    const confirmDelete = confirm(
      "Tem certeza que deseja excluir esta categoria? Os cards serão desvinculados."
    );
    if (!confirmDelete) return;

    try {
      const cards = await CardRepository.getAll();
      const affected = cards.filter((c) => c.categoryId === id);

      await Promise.all(
        affected.map((c) => CardRepository.update(c.id, { categoryId: "" }))
      );

      await CategoryRepository.delete(id);

      const updated = await CategoryRepository.getAll();
      setCategories(updated);

      showAlert("Categoria removida e cards desvinculados!", "success");
    } catch {
      showAlert("Erro ao excluir categoria.", "error");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Gerenciar Categorias</h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-hbl-green hover:bg-hbl-green/80 text-white px-3 py-2 rounded cursor-pointer"
        >
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-1 mb-4">
        Cada categoria pode ter um ícone do Lucide. Consulte a lista completa em{" "}
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          lucide.dev/icons
        </a>
        . Digite o nome exatamente como aparece para visualizar o preview.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <SortableItem
                key={cat.id}
                category={cat}
                onRename={async (data) => {
                  await CategoryRepository.update(cat.id, data);
                  setCategories((prev) =>
                    prev.map((c) => (c.id === cat.id ? { ...c, ...data } : c))
                  );
                  showAlert("Categoria atualizada!", "success");
                }}
                onDelete={() => deleteCategory(cat.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={saveOrder}
        disabled={savingOrder}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-hbl-green hover:bg-hbl-green/80 text-white py-2 rounded transition cursor-pointer"
      >
        <Save size={18} />
        {savingOrder ? "Salvando..." : "Salvar ordem"}
      </button>

      {/* Modal criar categoria */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-sm shadow">
            <h2 className="text-lg font-semibold mb-3 ">Nova Categoria</h2>

            <input
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Nome da categoria"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <div className="relative w-full mt-3">
              <input
                className="w-full border border-gray-300 rounded p-2 pr-10"
                placeholder="Ícone (ex: Coffee, Star, BookOpen)"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
              />

              {CreatePreviewIcon && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">
                  <CreatePreviewIcon size={20} />
                </span>
              )}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              O nome do ícone deve corresponder a um ícone válido do Lucide.
              <br />
              Consulte a lista completa em{" "}
              <a
                href="https://lucide.dev/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                lucide.dev/icons
              </a>
              .
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={createCategory}
                className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableItem({
  category,
  onRename,
  onDelete,
}: {
  category: CategoryType;
  onRename: (data: Partial<CategoryType>) => Promise<void>;
  onDelete: () => void;
}) {
  const { id } = category;
  const [editingName, setEditingName] = useState(category.name);
  const [editingIcon, setEditingIcon] = useState(category.iconName || "");
  const [saving, setSaving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const PreviewIcon = IconMap[normalizeIconName(editingIcon)];

  async function handleSave() {
    if (!editingName.trim()) return;

    if (editingIcon.trim()) {
      const normalized = normalizeIconName(editingIcon.trim());

      if (!IconMap[normalized]) {
        alert(`Ícone "${editingIcon}" não existe no Lucide.`);
        return;
      }
    }

    setSaving(true);
    await onRename({
      name: editingName.trim(),
      iconName: editingIcon.trim() || undefined,
    });
    setSaving(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded bg-gray-50"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-move text-gray-500 hover:text-gray-700 self-start sm:self-center"
      >
        <GripVertical size={20} />
      </button>

      {/* Nome da categoria - ocupa a linha toda no mobile */}
      <input
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        className="w-full sm:flex-1 border border-gray-300 rounded p-2"
      />

      {/* Campo de ícone com preview interno */}
      <div className="relative w-full sm:w-36">
        <input
          value={editingIcon}
          onChange={(e) => setEditingIcon(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 pr-10 text-sm"
          placeholder="Ícone"
        />

        {PreviewIcon && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">
            <PreviewIcon size={18} />
          </span>
        )}
      </div>

      <div className="flex gap-2 self-end sm:self-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-2 text-white rounded bg-hbl-green hover:bg-hbl-green/80 cursor-pointer"
        >
          <Check size={18} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
