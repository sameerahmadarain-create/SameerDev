import React from 'react';
import { Project } from '../../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  project,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#140e0b] border border-rose-500/30 shadow-2xl shadow-black/95 p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 id="delete-dialog-title" className="text-xl font-bold text-white tracking-tight">
            Delete Project?
          </h3>
          <p id="delete-dialog-description" className="text-sm text-stone-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white font-semibold">"{project.name}"</strong>? This project will be removed from your portfolio showcase.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] btn-micro-fx"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl btn-micro-fx shadow-lg shadow-rose-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
