import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

interface Props {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({ onSave, onDiscard, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative w-[400px] bg-white rounded-2xl shadow-2xl border border-panel-border overflow-hidden"
        style={{ animation: 'fadeInUp 0.25s ease-out' }}
      >
        {/* Accent bar */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
        />

        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Unsaved Changes</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                You have unsaved changes to this project.
              </p>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed mb-6">
            Would you like to save your changes before leaving? Any unsaved changes will be lost.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onDiscard}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-panel-border bg-white text-text-primary text-xs font-semibold hover:bg-surface-1 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-xs font-semibold shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: '#5e6ad2' }}
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
