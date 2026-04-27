"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { WeightForm } from "./weight-form";
import { deleteWeight } from "@/app/actions/weight";

interface EditWeightBottomSheetProps {
  open: boolean;
  onClose: () => void;
  date: string;
  initialWeight?: number | null;
  onSuccess: (weight: number) => void;
  onDelete?: () => void;
}

export function EditWeightBottomSheet({
  open,
  onClose,
  date,
  initialWeight,
  onSuccess,
  onDelete,
}: EditWeightBottomSheetProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteWeight(date);
      onDelete?.();
      onClose();
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <WeightForm
        date={date}
        initialWeight={initialWeight}
        onSuccess={(weight) => {
          onSuccess(weight);
          onClose();
        }}
        onBack={onClose}
      />
      {initialWeight != null && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="mt-1 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-destructive disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isPending ? "Excluindo…" : "Excluir registro"}
        </button>
      )}
    </BottomSheet>
  );
}
