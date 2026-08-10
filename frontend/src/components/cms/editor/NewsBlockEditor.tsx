"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { CmsRichTextEditor } from "@/src/components/cms/editor/CmsRichTextEditor";
import { CmsMediaField } from "@/src/components/cms/editor/CmsMediaPicker";
import { cmsInputClass, cmsSelectClass, cmsTextareaClass } from "@/src/components/cms/editor/CmsFormField";
import {
  createEmptyBlock,
  type NewsBlock,
  type NewsBlockType,
} from "@/src/lib/newsBlocks";
import type { MediaAsset } from "@/src/lib/cms/editorial/types";

const BLOCK_OPTIONS: { type: NewsBlockType; label: string }[] = [
  { type: "paragraph", label: "Párrafo" },
  { type: "heading", label: "Encabezado" },
  { type: "image", label: "Imagen" },
  { type: "list", label: "Lista" },
  { type: "quote", label: "Cita" },
  { type: "divider", label: "Separador" },
  { type: "button", label: "Botón / enlace" },
];

type Props = {
  blocks: NewsBlock[];
  onChange: (blocks: NewsBlock[]) => void;
  disabled?: boolean;
};

function SortableBlock({
  block,
  index,
  total,
  disabled,
  onChange,
  onDuplicate,
  onRemove,
  onMove,
}: {
  block: NewsBlock;
  index: number;
  total: number;
  disabled?: boolean;
  onChange: (block: NewsBlock) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-50 active:cursor-grabbing"
          aria-label="Arrastrar bloque"
          {...attributes}
          {...listeners}
          disabled={disabled}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {BLOCK_OPTIONS.find((o) => o.type === block.type)?.label ?? block.type}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => onMove(-1)}
            disabled={disabled || index === 0}
            aria-label="Mover arriba"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => onMove(1)}
            disabled={disabled || index >= total - 1}
            aria-label="Mover abajo"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-50"
            onClick={onDuplicate}
            disabled={disabled}
            aria-label="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-red-500 hover:bg-red-50"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <BlockFields block={block} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
  disabled,
}: {
  block: NewsBlock;
  onChange: (block: NewsBlock) => void;
  disabled?: boolean;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <CmsRichTextEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          disabled={disabled}
        />
      );
    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <select
            className={cmsSelectClass}
            value={block.level}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...block, level: Number(e.target.value) === 3 ? 3 : 2 })
            }
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            className={cmsInputClass}
            value={block.text}
            disabled={disabled}
            placeholder="Texto del encabezado"
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <CmsMediaField
            label="Imagen del bloque"
            asset={
              block.media_id
                ? ({
                    id: block.media_id,
                    file_url: block.preview_url ?? null,
                    file: block.preview_url ?? null,
                    title: block.alt || "Imagen",
                    alt_text: block.alt,
                    caption: block.caption,
                    media_type: "image",
                    file_size_bytes: null,
                    mime_type: null,
                    created_at: "",
                  } as MediaAsset)
                : null
            }
            onSelect={(asset) =>
              onChange({
                ...block,
                media_id: asset.id,
                preview_url: asset.file_url ?? asset.file ?? null,
                alt: asset.alt_text || block.alt,
                caption: asset.caption || block.caption,
              })
            }
            onClear={() =>
              onChange({
                ...block,
                media_id: null,
                preview_url: null,
              })
            }
          />
          <input
            className={cmsInputClass}
            value={block.alt}
            disabled={disabled}
            placeholder="Texto alternativo"
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
          />
          <input
            className={cmsInputClass}
            value={block.caption}
            disabled={disabled}
            placeholder="Pie de foto"
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
          />
        </div>
      );
    case "list":
      return (
        <div className="space-y-3">
          <select
            className={cmsSelectClass}
            value={block.style}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...block,
                style: e.target.value === "ordered" ? "ordered" : "bullet",
              })
            }
          >
            <option value="bullet">Viñetas</option>
            <option value="ordered">Numerada</option>
          </select>
          <textarea
            className={cmsTextareaClass}
            rows={5}
            disabled={disabled}
            value={block.items.join("\n")}
            placeholder="Un ítem por línea"
            onChange={(e) =>
              onChange({
                ...block,
                items: e.target.value.split("\n"),
              })
            }
          />
        </div>
      );
    case "quote":
      return (
        <div className="space-y-3">
          <textarea
            className={cmsTextareaClass}
            rows={3}
            disabled={disabled}
            value={block.text}
            placeholder="Cita"
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
          <input
            className={cmsInputClass}
            disabled={disabled}
            value={block.attribution}
            placeholder="Atribución"
            onChange={(e) => onChange({ ...block, attribution: e.target.value })}
          />
        </div>
      );
    case "divider":
      return <p className="text-sm text-slate-500">Separador visual (sin contenido).</p>;
    case "button":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={cmsInputClass}
            disabled={disabled}
            value={block.label}
            placeholder="Etiqueta"
            onChange={(e) => onChange({ ...block, label: e.target.value })}
          />
          <input
            className={cmsInputClass}
            disabled={disabled}
            value={block.url}
            placeholder="URL"
            onChange={(e) => onChange({ ...block, url: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={block.open_in_new_tab}
              disabled={disabled}
              onChange={(e) => onChange({ ...block, open_in_new_tab: e.target.checked })}
            />
            Abrir en nueva pestaña
          </label>
        </div>
      );
  }
}

export function NewsBlockEditor({ blocks, onChange, disabled }: Props) {
  const [addType, setAddType] = useState<NewsBlockType>("paragraph");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(blocks, oldIndex, newIndex));
  };

  const updateAt = (index: number, next: NewsBlock) => {
    const copy = [...blocks];
    copy[index] = next;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={cmsSelectClass}
          value={addType}
          disabled={disabled}
          onChange={(e) => setAddType(e.target.value as NewsBlockType)}
        >
          {BLOCK_OPTIONS.map((opt) => (
            <option key={opt.type} value={opt.type}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-lg bg-[#252A58] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d2248] disabled:opacity-50"
          onClick={() => onChange([...blocks, createEmptyBlock(addType)])}
        >
          <Plus className="h-4 w-4" />
          Agregar bloque
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <SortableBlock
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                disabled={disabled}
                onChange={(next) => updateAt(index, next)}
                onDuplicate={() => {
                  const clone = { ...structuredClone(block), id: createEmptyBlock(block.type).id };
                  const copy = [...blocks];
                  copy.splice(index + 1, 0, clone);
                  onChange(copy);
                }}
                onRemove={() => onChange(blocks.filter((_, i) => i !== index))}
                onMove={(dir) => {
                  const target = index + dir;
                  if (target < 0 || target >= blocks.length) return;
                  onChange(arrayMove(blocks, index, target));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!blocks.length ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          Agregue bloques editoriales para construir el cuerpo de la noticia.
        </p>
      ) : null}
    </div>
  );
}
