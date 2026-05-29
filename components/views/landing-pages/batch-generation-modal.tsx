'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ChevronDown,
  HardDrive,
  CheckCircle2,
  Zap,
  ArrowRight,
  Loader2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ApiProduct, CreateLpBatchDto } from '@/lib/api/types';
import { pickGoogleDriveFile, pickMoreDriveFiles, hasDriveToken, loadGoogleDriveSdk, type DriveFile } from '@/lib/google-drive';
import { useCreateLpBatch, useLpBatchLogStream } from '@/lib/hooks/use-lp-batch';
import { getBatchGeneratedLandingPages } from '@/lib/api/lp-batch';
import { useTopLpTemplates } from '@/lib/hooks/use-lp-templates';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BatchGenerationModalProps {
  product: ApiProduct;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (batchId: string) => void;
}

export function BatchGenerationModal({ product, isOpen, onClose, onConfirm }: BatchGenerationModalProps) {
  const { t } = useTranslation();
  const [source, setSource] = useState<'ai' | 'drive'>('ai');
  const [strategy, setStrategy] = useState<'auto' | 'manual'>('auto');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [count, setCount] = useState(3);
  const [lang, setLang] = useState('en-US');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // SSE generation phase
  const [generatingBatchId, setGeneratingBatchId] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const createBatchMutation = useCreateLpBatch();
  const { data: topTemplates = [] } = useTopLpTemplates(4);

  const { logs, isDone, error: sseError } = useLpBatchLogStream(generatingBatchId);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (isOpen) loadGoogleDriveSdk();
  }, [isOpen]);

  // When SSE done → fetch generated LPs → log → navigate
  useEffect(() => {
    if (!isDone || !generatingBatchId) return;
    (async () => {
      try {
        const result = await getBatchGeneratedLandingPages(generatingBatchId);
        console.log('[batch] generated landing pages:', result);
      } catch (err) {
        console.error('[batch] fetch landing pages error:', err);
      }
      onConfirm(generatingBatchId);
    })();
  }, [isDone, generatingBatchId, onConfirm]);

  const handleViewResults = () => {
    if (!generatingBatchId) return;
    onConfirm(generatingBatchId);
  };


  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const openDrivePicker = async () => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const files = await pickGoogleDriveFile();
      setDriveFiles(files);
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      setDriveError(err instanceof Error ? err.message : 'Failed to connect to Google Drive');
    } finally {
      setDriveLoading(false);
    }
  };

  const addMoreDriveFiles = async () => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const newFiles = hasDriveToken() ? await pickMoreDriveFiles() : await pickGoogleDriveFile();
      setDriveFiles(prev => {
        const ids = new Set(prev.map(f => f.id));
        return [...prev, ...newFiles.filter(f => !ids.has(f.id))];
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      setDriveError(err instanceof Error ? err.message : 'Failed to pick files');
    } finally {
      setDriveLoading(false);
    }
  };

  const removeDriveFile = (id: string) => {
    setDriveFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSelectSource = async (next: 'ai' | 'drive') => {
    setSource(next);
    if (next === 'drive') {
      setDriveFiles([]);
      await openDrivePicker();
    } else {
      setDriveFiles([]);
      setDriveError(null);
    }
  };

  const handleCreate = async () => {
    setSubmitError(null);

    if (strategy === 'manual' && selectedTemplateIds.length === 0) {
      setSubmitError('Select at least one template.');
      return;
    }

    if (source === 'drive' && driveFiles.length === 0) {
      setSubmitError('Please connect a Google Drive file first.');
      return;
    }

    const dto: CreateLpBatchDto = {
      productId: product.id,
      count,
      lang,
      contentSource: source === 'drive' ? 'GOOGLE_DRIVE' : 'AI_AUTO',
      templateStrategy: strategy === 'manual' ? 'MANUAL' : 'AI_OPTIMIZE',
      ...(strategy === 'manual' && { templateIds: selectedTemplateIds }),
      ...(source === 'drive' && driveFiles.length > 0 && {
        driveFileIds: driveFiles.map(f => f.id),
      }),
    };

    try {
      const res = await createBatchMutation.mutateAsync(dto);
      console.log('[batch] created:', res);
      setGeneratingBatchId(res.data.batchJobId);
    } catch (err) {
      console.error('[batch] create error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Batch creation failed');
    }
  };

  if (!isOpen) return null;

  const isSubmitting = createBatchMutation.isPending;
  const submitDisabled = isSubmitting || driveLoading || (source === 'drive' && driveFiles.length === 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#0c0c0c] rounded-[40px] shadow-2xl overflow-hidden"
      >
        {generatingBatchId ? (
          /* ── Generating phase ── */
          <div className="flex flex-col px-10 pt-10 pb-10 gap-6">
            {/* Status header */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0",
                isDone && !sseError ? "bg-emerald-500 shadow-emerald-500/20" :
                sseError ? "bg-red-500 shadow-red-500/20" :
                "bg-indigo-600 shadow-indigo-600/20"
              )}>
                {sseError ? <AlertTriangle size={22} /> :
                 isDone ? <CheckCircle2 size={22} /> :
                 <Loader2 size={22} className="animate-spin" />}
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-black dark:text-white uppercase tracking-tight leading-none mb-0.5">
                  {sseError ? 'Generation Failed' : isDone ? 'Generation Complete' : 'Generating…'}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                  {sseError ? sseError : isDone ? 'All landing pages are ready' : 'AI is creating your landing pages'}
                </p>
              </div>
            </div>

            {/* Log messages */}
            <div className="h-56 overflow-y-auto space-y-1 no-scrollbar">
              {logs.length === 0 && !sseError && (
                <p className="text-xs text-gray-400 dark:text-white/20 italic">Connecting to stream…</p>
              )}
              {logs.map(line => (
                <div key={line.id} className="flex items-start gap-2 text-xs">
                  {line.time && (
                    <span className="text-gray-400 dark:text-white/30 shrink-0 tabular-nums">{line.time}</span>
                  )}
                  <span className="text-gray-700 dark:text-white/70 break-all">{line.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {/* View Results — enabled once logs arrive */}
              {logs.length > 0 && !sseError && (
                <button
                  onClick={handleViewResults}
                  className="flex-1 h-12 bg-indigo-600 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/30"
                >
                  {isDone ? 'View Results' : 'View Results (generating…)'}
                  <ArrowRight size={14} />
                </button>
              )}
              {sseError && (
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-[28px] border-2 border-gray-200 dark:border-white/10 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Form phase ── */
          <div>

        {/* Header */}
        <div className="px-10 pt-10 pb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-black dark:text-white uppercase tracking-tight leading-none mb-1">
                {t('landing_pages.batch.title')}
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                {t('landing_pages.batch.subtitle')} {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-10 pb-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Config Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                {t('landing_pages.batch.display_language')}
              </label>
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none"
                >
                  <option value="en-US">English (US)</option>
                  <option value="vi-VN">Vietnamese</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ro-RO">Romanian</option>
                </select>
                <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                {t('landing_pages.batch.number_of_lps')}
              </label>
              <input
                type="number"
                min={1}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
              />
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              {t('landing_pages.batch.source_selection')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* AI Auto */}
              <button
                onClick={() => handleSelectSource('ai')}
                disabled={driveLoading}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left",
                  source === 'ai'
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/5"
                    : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  source === 'ai' ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                )}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">
                    {t('landing_pages.batch.one_click')}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">
                    {t('landing_pages.batch.one_click_desc')}
                  </p>
                </div>
              </button>

              {/* Google Drive — triggers picker immediately on click */}
              <button
                onClick={() => handleSelectSource('drive')}
                disabled={driveLoading}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left",
                  source === 'drive'
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/5"
                    : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  source === 'drive' ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                )}>
                  {driveLoading ? <Loader2 size={20} className="animate-spin" /> : <HardDrive size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">
                    {t('landing_pages.batch.google_drive')}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">
                    {driveLoading ? 'Opening picker…' : t('landing_pages.batch.google_drive_desc')}
                  </p>
                </div>
              </button>
            </div>

            {/* Drive file status */}
            {source === 'drive' && driveFiles.length > 0 && (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl space-y-1.5">
                  {driveFiles.map(f => (
                    <div key={f.id} className="flex items-center gap-2">
                      <FileText size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate flex-1">
                        {f.name}
                      </p>
                      <button
                        onClick={() => removeDriveFile(f.id)}
                        className="p-0.5 text-emerald-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMoreDriveFiles}
                  disabled={driveLoading}
                  className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:opacity-70 transition-opacity px-4"
                >
                  {driveLoading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                  Add more files
                </button>
              </div>
            )}

            {source === 'drive' && driveError && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider px-1">
                {driveError}
              </p>
            )}

            {source === 'drive' && driveFiles.length === 0 && !driveLoading && !driveError && (
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider px-1">
                No file selected — click Google Drive to pick files.
              </p>
            )}
          </div>

          {/* Strategy & Templates */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              {t('landing_pages.batch.template_strategy')}
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { id: 'auto', title: t('landing_pages.batch.opt_a'), desc: t('landing_pages.batch.opt_a_desc') },
                { id: 'manual', title: t('landing_pages.batch.opt_b'), desc: t('landing_pages.batch.opt_b_desc') },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setStrategy(item.id as 'auto' | 'manual')}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-left relative",
                    strategy === item.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/5 shadow-xl shadow-indigo-600/5"
                      : "border-gray-100 dark:border-white/5"
                  )}
                >
                  <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight mb-2 pr-8">{item.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  {strategy === item.id && (
                    <div className="absolute top-6 right-6 text-indigo-600">
                      <CheckCircle2 size={20} fill="currentColor" className="text-indigo-600" style={{ color: 'white' }} />
                      <CheckCircle2 size={20} className="absolute inset-0" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {strategy === 'manual' && (
              <div className="grid grid-cols-2 gap-4">
                {topTemplates.map(tpl => {
                  const selected = selectedTemplateIds.includes(tpl.id);
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => toggleTemplate(tpl.id)}
                      className={cn(
                        "group bg-white dark:bg-black/20 border rounded-3xl overflow-hidden transition-all",
                        selected ? "border-indigo-600" : "border-gray-100 dark:border-white/5"
                      )}
                    >
                      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-white/5">
                        {tpl.screenshotUrl ? (
                          <Image src={tpl.screenshotUrl} alt={tpl.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles size={24} className="text-gray-300 dark:text-white/20" />
                          </div>
                        )}
                        {tpl.perfScore != null && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[9px] font-black text-white">
                            CVR {(tpl.perfScore * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-tight">{tpl.name}</span>
                        {selected && <CheckCircle2 size={16} className="text-indigo-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Action Button */}
        <div className="px-10 pb-12 pt-4">
          <button
            onClick={handleCreate}
            disabled={submitDisabled}
            className="w-full h-16 bg-indigo-600 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-xs relative group overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-600/40 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {isSubmitting ? (
              <div className="relative flex items-center justify-center gap-3">
                <Loader2 size={18} className="animate-spin" />
                <span>Creating batch…</span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center gap-4">
                <span className="group-hover:tracking-[0.3em] transition-all duration-500">
                  {t('landing_pages.batch.create_button')}
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500">
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )}
          </button>
          <p className="text-center mt-6 text-[9px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.4em]">
            AI will generate assets based on your product SKU & status
          </p>
        </div>

        {submitError && (
          <p className="px-10 pb-4 text-[11px] font-bold text-red-500 text-center">
            {submitError}
          </p>
        )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
