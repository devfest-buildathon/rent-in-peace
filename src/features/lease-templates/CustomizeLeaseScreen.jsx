import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLeasePresets } from './useLeasePresets';
import ClauseEditorModal from './components/ClauseEditorModal';
import AiSuggestClauseModal from './components/AiSuggestClauseModal';
import LivePreviewModal from './components/LivePreviewModal';
import ConfirmDialog from './components/ConfirmDialog';
import {
  ChevronLeft,
  Plus,
  Copy,
  Trash2,
  Eye,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Edit3,
  Check,
  AlertTriangle,
  Lock,
  Save,
  Loader2,
  FileText,
  Sliders,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function CustomizeLeaseScreen() {
  const { setCurrentScreen, landlordProfile, userRole } = useApp();
  const landlordId = landlordProfile?.phone || landlordProfile?.id || 'demo_landlord';

  const {
    presets,
    activePreset,
    isLoading,
    isSaving,
    error,
    setError,
    hasUnsavedChanges,
    selectPreset,
    updateDraft,
    handleSave,
    handleCreateNew,
    handleDuplicate,
    handleDelete,
    toggleClause,
    addClause,
    updateClause,
    removeClause,
    moveClauseUp,
    moveClauseDown
  } = useLeasePresets(landlordId);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingClause, setEditingClause] = useState(null);
  const [isAiSuggestOpen, setIsAiSuggestOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: () => {}
  });

  // Handle navigation back with unsaved changes check
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: 'Discard Unsaved Changes?',
        message: 'You have unsaved changes in this preset. If you leave now, your edits will not be saved.',
        isDestructive: true,
        action: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setCurrentScreen('LANDLORD_HOME');
        }
      });
      return;
    }
    setCurrentScreen('LANDLORD_HOME');
  };

  // Switch preset tab with unsaved warning
  const handleSelectPresetTab = (targetId) => {
    if (targetId === activePreset.id) return;
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: 'Switch Preset?',
        message: 'You have unsaved changes in the current preset. Do you want to discard them and switch?',
        isDestructive: true,
        action: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          selectPreset(targetId, true);
        }
      });
      return;
    }
    selectPreset(targetId);
  };

  const onSavePreset = async () => {
    const success = await handleSave();
    if (success) {
      setSaveToast('Preset saved successfully to your landlord profile!');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const handleDuplicateClick = async () => {
    const newName = `${activePreset.name} (Custom Copy)`;
    const duplicated = await handleDuplicate(activePreset.id, newName);
    if (duplicated) {
      setSaveToast(`Created custom editable copy: "${duplicated.name}"`);
      setTimeout(() => setSaveToast(''), 3500);
    }
  };

  const handleDeleteClick = () => {
    if (activePreset.isBuiltIn) {
      setError('Built-in starter presets cannot be deleted.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Preset?',
      message: `Are you sure you want to delete "${activePreset.name}"? This action cannot be undone.`,
      isDestructive: true,
      action: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const success = await handleDelete(activePreset.id);
        if (success) {
          setSaveToast('Preset removed.');
          setTimeout(() => setSaveToast(''), 3000);
        }
      }
    });
  };

  const handleNewPresetClick = () => {
    const name = window.prompt('Enter a name for your new lease preset:', 'Custom Room Lease');
    if (!name || !name.trim()) return;
    handleCreateNew(name.trim(), 'Custom lease preset');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F4F8F5]">
        <Loader2 className="w-8 h-8 text-[#14532D] animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-700">Loading your lease presets...</p>
        <p className="text-[11px] text-slate-400 mt-1">Retrieving stored clauses from Firestore</p>
      </div>
    );
  }

  const enabledClausesCount = activePreset.clauses.filter((c) => c.enabled !== false).length;

  return (
    <div className="flex-1 flex flex-col justify-between px-4 sm:px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-4">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
            title="Return to Dashboard"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-slate-900">Customize Lease</h2>
            <p className="text-[10px] text-slate-400">Kasulatan Preset Designer</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
            title="Preview Live Document"
          >
            <Eye className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Banner with Success or Error Toast */}
        {saveToast && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold shadow-2xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#14532D] shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-600 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Preset Library Horizontal Tabs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PRESET LIBRARY</span>
            <button
              type="button"
              onClick={handleNewPresetClick}
              className="text-xs font-bold text-[#14532D] hover:text-[#047857] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Preset</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
            {presets.map((preset) => {
              const isSelected = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPresetTab(preset.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 snap-start shadow-2xs ${
                    isSelected
                      ? 'bg-[#14532D] text-white'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {preset.isBuiltIn && <Lock className="w-3 h-3 opacity-70" />}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Preset Metadata Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs mb-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {activePreset.isBuiltIn ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-slate-900 truncate">{activePreset.name}</h3>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      Built-in Starter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{activePreset.description}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Preset Name</label>
                    <input
                      type="text"
                      value={activePreset.name}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Bedspace - Female Boarders"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Description</label>
                    <input
                      type="text"
                      value={activePreset.description}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief note on when to use this preset..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Top Action Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDuplicateClick}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Duplicate into editable custom copy"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>

              {!activePreset.isBuiltIn && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                  title="Delete this custom preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Read-Only Notice for Built-In Presets */}
          {activePreset.isBuiltIn && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Starter templates are read-only.</span>
              </div>
              <button
                type="button"
                onClick={handleDuplicateClick}
                className="text-[#14532D] font-bold hover:underline cursor-pointer"
              >
                Make Editable Copy
              </button>
            </div>
          )}

          {/* Clauses Count Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>
              {enabledClausesCount} of {activePreset.clauses.length} clauses active
            </span>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-[#14532D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>View Full Paper</span>
            </button>
          </div>
        </div>

        {/* Clauses Header & AI Assistant Bar */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            LEASE CLAUSES ({activePreset.clauses.length})
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiSuggestOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-800 to-[#14532D] hover:from-emerald-900 hover:to-[#0f4022] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Suggest Clause</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingClause(null);
                setIsEditorOpen(true);
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#14532D]" />
              <span>Add Clause</span>
            </button>
          </div>
        </div>

        {/* Clauses List */}
        <div className="space-y-2.5 mb-4">
          {activePreset.clauses.map((clause, index) => {
            const isFirst = index === 0;
            const isLast = index === activePreset.clauses.length - 1;
            const isEnabled = clause.enabled !== false;
            const hasMissingLanguage = !clause.english?.trim() || !clause.bisaya?.trim();

            return (
              <div
                key={clause.id}
                className={`p-3.5 rounded-3xl border transition-all shadow-2xs ${
                  isEnabled
                    ? 'bg-white border-slate-200/90'
                    : 'bg-slate-100/70 border-slate-200/60 opacity-60'
                }`}
              >
                {/* Clause Header Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleClause(clause.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${
                        isEnabled
                          ? 'bg-[#14532D] text-white'
                          : 'bg-slate-200 border border-slate-300 text-transparent'
                      }`}
                      title={isEnabled ? 'Clause enabled (click to disable)' : 'Clause disabled (click to enable)'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <span className="text-xs font-bold text-slate-900 truncate">
                      {index + 1}. {(clause.title || '').replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>

                  {/* Clause Action Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reorder Up */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveClauseUp(index)}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Reorder Down */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveClauseDown(index)}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Clause */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClause(clause);
                        setIsEditorOpen(true);
                      }}
                      className="p-1 text-slate-500 hover:text-[#14532D] transition cursor-pointer"
                      title="Edit Clause"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove Clause */}
                    <button
                      type="button"
                      onClick={() => removeClause(clause.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      title="Remove Clause"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* English Text Preview */}
                <p className="text-xs text-slate-700 leading-relaxed">
                  {clause.english || <span className="text-amber-600 italic">No English text specified</span>}
                </p>

                {/* Bisaya Text Preview */}
                {clause.bisaya ? (
                  <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-bold text-[#14532D]">Bisaya: </span>
                    <span className="italic">{clause.bisaya}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] text-amber-700">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Warning: Bisaya translation is missing.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note regarding enforceability */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl mb-4 text-[11px] text-amber-900 leading-snug flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Legal Disclaimer: </span>
            The landlord is responsible for reviewing all clauses. Rent in Peace does not guarantee legal enforceability or provide formal legal representation.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="pt-3 pb-1 border-t border-slate-200 bg-[#F4F8F5] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:border-slate-400 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#14532D]" />
          <span>Live Preview</span>
        </button>

        <button
          type="button"
          disabled={isSaving || activePreset.isBuiltIn}
          onClick={onSavePreset}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            activePreset.isBuiltIn
              ? 'bg-slate-400 cursor-not-allowed opacity-75'
              : hasUnsavedChanges
              ? 'bg-[#14532D] hover:bg-[#0f4022] ring-2 ring-emerald-600 ring-offset-1'
              : 'bg-[#14532D] hover:bg-[#0f4022]'
          }`}
          title={activePreset.isBuiltIn ? 'Built-in presets are read-only. Duplicate first to edit and save.' : 'Save changes'}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{activePreset.isBuiltIn ? 'Read-Only (Duplicate)' : hasUnsavedChanges ? 'Save Changes *' : 'Preset Saved'}</span>
        </button>
      </div>

      {/* Clause Editor Modal */}
      <ClauseEditorModal
        isOpen={isEditorOpen}
        clause={editingClause}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingClause(null);
        }}
        onSave={({ title, english, bisaya }) => {
          if (editingClause) {
            updateClause(editingClause.id, { title, english, bisaya });
          } else {
            addClause({ title, english, bisaya, enabled: true });
          }
        }}
        onOpenAiSuggest={() => {
          setIsEditorOpen(false);
          setIsAiSuggestOpen(true);
        }}
      />

      {/* AI Suggest Clause Modal */}
      <AiSuggestClauseModal
        isOpen={isAiSuggestOpen}
        onClose={() => setIsAiSuggestOpen(false)}
        onAccept={({ title, english, bisaya }) => {
          addClause({ title, english, bisaya, enabled: true });
          setSaveToast('AI-drafted clause added to preset. Remember to save your preset.');
          setTimeout(() => setSaveToast(''), 3500);
        }}
      />

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        preset={activePreset}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
