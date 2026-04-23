"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import type { AdminConfirmDialogState } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

type AdminConfirmModalProps = {
  dialog: AdminConfirmDialogState | null;
  working: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onInputChange: (value: string) => void;
};

export function AdminConfirmModal({
  dialog,
  working,
  onClose,
  onConfirm,
  onInputChange
}: AdminConfirmModalProps) {
  useEffect(() => {
    if (!dialog) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !working) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog, onClose, working]);

  if (!dialog) {
    return null;
  }

  const requiresMatch = Boolean(dialog.requireMatchText);
  const matchesRequiredText =
    !requiresMatch || dialog.inputValue.trim() === dialog.requireMatchText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        disabled={working}
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="panel-2xl relative z-10 w-full max-w-xl overflow-hidden border border-line p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                dialog.tone === "danger"
                  ? "border-error/25 bg-error/10 text-error"
                  : "border-warning/25 bg-warning/10 text-warning"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <h2
                id="admin-confirm-title"
                className="font-[family:var(--font-display)] text-3xl uppercase leading-none text-foreground"
              >
                {dialog.title}
              </h2>
              <p className="max-w-lg text-sm leading-7 text-muted">
                {dialog.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={working}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel-secondary text-muted"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {requiresMatch ? (
          <div className="mt-6 space-y-2">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                {dialog.inputLabel}
              </span>
              <input
                value={dialog.inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                className="input-field"
                placeholder={dialog.inputPlaceholder}
                autoFocus
              />
            </label>
            <p className="text-xs leading-6 text-muted">
              Tippe exakt <span className="font-medium text-foreground">{dialog.requireMatchText}</span> ein, um fortzufahren.
            </p>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={working}
            className="control-pill"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={working || !matchesRequiredText}
            className={cn(
              "action-button",
              dialog.tone === "danger"
                ? "border-error bg-error text-white hover:bg-error"
                : ""
            )}
          >
            {working ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : null}
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
