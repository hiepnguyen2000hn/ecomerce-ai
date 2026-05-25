'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Image as ImageIcon, ChevronRight, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCreateProduct } from '@/lib/hooks/use-products';
import { createVariantGroup } from '@/lib/api/products';
import { uploadFiles } from '@/lib/api/file-storage';
import { showToast } from '@/lib/toast';

interface ImageEntry {
  file: File;
  previewUrl: string;
  storageId: string;
  uploading: boolean;
}

interface VariantOption {
  id: string;
  name: string;
  skuSuffix: string;
  price: string;
  stock: string;
}

interface VariantGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

interface ProductCreateProps {
  onBack: () => void;
}

export function ProductCreate({ onBack }: ProductCreateProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: submitCreate, isPending } = useCreateProduct();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [cogsAmount, setCogsAmount] = useState('');
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  const addVariantGroup = () => {
    setVariantGroups(prev => [...prev, {
      id: crypto.randomUUID(),
      name: `Variant Group #${prev.length + 1}`,
      options: [],
    }]);
  };

  const addVariantOption = (groupId: string) => {
    setVariantGroups(prev => prev.map(g => g.id !== groupId ? g : {
      ...g,
      options: [...g.options, {
        id: crypto.randomUUID(),
        name: 'New Option',
        skuSuffix: '',
        price: '',
        stock: '0',
      }],
    }));
  };

  const removeVariantGroup = (groupId: string) => {
    setVariantGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const updateGroupName = (groupId: string, value: string) => {
    setVariantGroups(prev => prev.map(g => g.id !== groupId ? g : { ...g, name: value }));
  };

  const updateOption = (groupId: string, optId: string, field: keyof VariantOption, value: string) => {
    setVariantGroups(prev => prev.map(g => g.id !== groupId ? g : {
      ...g,
      options: g.options.map(o => o.id !== optId ? o : { ...o, [field]: value }),
    }));
  };

  const removeOption = (groupId: string, optId: string) => {
    setVariantGroups(prev => prev.map(g => g.id !== groupId ? g : {
      ...g,
      options: g.options.filter(o => o.id !== optId),
    }));
  };

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) {
      showToast.error('Name and SKU are required');
      return;
    }
    try {
      // Collect file-storage URLs (only fully uploaded images)
      const imageUrls = images.filter(img => img.storageId).map(img => img.previewUrl);

      const product = await submitCreate({
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || undefined,
        retailPriceAmount: retailPrice ? parseFloat(retailPrice) : undefined,
        retailPriceCurrency: retailPrice ? 'USD' : undefined,
        cogsAmount: cogsAmount ? parseFloat(cogsAmount) : undefined,
        cogsCurrency: cogsAmount ? 'USD' : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      for (const group of variantGroups) {
        await createVariantGroup(product.id, {
          name: group.name,
          options: group.options.map((opt, i) => ({
            name: opt.name,
            skuSuffix: opt.skuSuffix || undefined,
            priceDelta: opt.price ? parseFloat(opt.price) : undefined,
            position: i,
          })),
        });
      }
      showToast.success('Product created');
      onBack();
    } catch {
      showToast.error('Failed to create product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    e.target.value = '';

    const tempEntries: ImageEntry[] = newFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      storageId: '',
      uploading: true,
    }));
    setImages(prev => [...prev, ...tempEntries]);

    try {
      const stored = await uploadFiles(newFiles);
      setImages(prev => {
        const result = [...prev];
        newFiles.forEach((file, i) => {
          const idx = result.findIndex(e => e.file === file && e.uploading);
          if (idx !== -1 && stored[i]) {
            URL.revokeObjectURL(result[idx].previewUrl);
            result[idx] = { ...result[idx], previewUrl: stored[i].url, storageId: stored[i].id, uploading: false };
          }
        });
        return result;
      });
    } catch {
      setImages(prev => prev.map(e => newFiles.includes(e.file) ? { ...e, uploading: false } : e));
      showToast.error('Failed to upload image');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const entry = prev[index];
      if (entry?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedImage(prev => (prev >= index && prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] dark:bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-10 py-6 bg-[#f8f9fc]/80 dark:bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span
            className="hover:text-black dark:hover:text-white cursor-pointer transition-colors"
            onClick={onBack}
          >
            {t('nav.products')}
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-black dark:text-white font-bold">New Product</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            disabled={isPending}
            className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-40 uppercase tracking-widest transition-all"
          >
            {t('common.discard')}
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-8 py-3 bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            {isPending ? 'Saving…' : t('common.save')}
          </button>
        </div>
      </div>

      <div className="px-10 pb-20 grid grid-cols-1 xl:grid-cols-[1fr_550px] gap-12 items-start">
        {/* Left: Image upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-12 shadow-sm dark:shadow-none"
        >
          <div
            onClick={() => images.length === 0 && fileInputRef.current?.click()}
            className={cn(
              'relative w-full aspect-square rounded-[32px] overflow-hidden bg-[#fafbfc] dark:bg-black/40 border-2 border-dashed border-gray-200 dark:border-white/10 transition-all',
              images.length === 0 && 'cursor-pointer hover:border-blue-600/40 hover:bg-blue-50/30 dark:hover:bg-blue-600/5',
            )}
          >
            {images.length > 0 ? (
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[selectedImage]?.previewUrl}
                  alt="Product preview"
                  className="w-full h-full object-contain"
                />
                {images[selectedImage]?.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-[32px]">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-300 dark:text-gray-700">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Click to upload image</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-8 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative shrink-0">
                <button
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-0.5',
                    selectedImage === i ? 'border-blue-600' : 'border-gray-100 dark:border-white/5 opacity-60 hover:opacity-100',
                  )}
                >
                  <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-gray-50 dark:bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all gap-1"
            >
              <ImageIcon size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Add</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </motion.div>

        {/* Right: Form */}
        <div className="space-y-8">
          {/* General Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                  {t('products.product_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Product name..."
                  className="w-full text-2xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none bg-transparent border-b-2 border-gray-100 dark:border-white/10 focus:border-blue-600 outline-none pb-2 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-800"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                  {t('products.sku_reference')}
                </label>
                <div className="bg-[#f0f4ff] dark:bg-blue-600/10 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-600/20">
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="WF-XX-00"
                    className="w-full text-blue-600 dark:text-blue-400 font-mono text-sm font-black tracking-widest bg-transparent outline-none placeholder:text-blue-200 dark:placeholder:text-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Price + COGS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Retail Price</label>
                <div className="flex items-center gap-2 bg-[#f8f9fb] dark:bg-black border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4">
                  <span className="text-gray-400 font-black text-sm">$</span>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={e => setRetailPrice(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-black dark:text-white font-black text-sm outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">COGS</label>
                <div className="flex items-center gap-2 bg-[#f8f9fb] dark:bg-black border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4">
                  <span className="text-gray-400 font-black text-sm">$</span>
                  <input
                    type="number"
                    value={cogsAmount}
                    onChange={e => setCogsAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-black dark:text-white font-black text-sm outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                  {t('products.description')}
                </label>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                  <Sparkles size={14} className="text-blue-600" />
                  {t('products.ai_rewrite')}
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your product..."
                className="w-full bg-[#f8f9fb] dark:bg-black border border-gray-100 dark:border-white/5 rounded-[24px] p-8 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed min-h-[160px] focus:ring-1 focus:ring-blue-600/20 outline-none transition-all resize-none no-scrollbar placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
            </div>
          </motion.div>

          {/* Variant Groups */}
          <div className="space-y-6">
            <AnimatePresence>
              {variantGroups.map((group, gi) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ delay: 0.04 * gi }}
                  className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-8">
                    <input
                      type="text"
                      value={group.name}
                      onChange={e => updateGroupName(group.id, e.target.value)}
                      className="font-black text-black dark:text-white uppercase tracking-tighter text-lg bg-transparent border-b border-transparent focus:border-gray-200 dark:focus:border-white/10 outline-none transition-all pb-0.5 w-auto max-w-[55%]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addVariantOption(group.id)}
                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-600/10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all"
                      >
                        <Plus size={14} />
                        {t('products.add_variant')}
                      </button>
                      <button
                        onClick={() => removeVariantGroup(group.id)}
                        className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {group.options.map(opt => (
                        <motion.div
                          key={opt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-6 bg-[#fcfdfe] dark:bg-[#080808] p-5 rounded-[32px] border border-gray-50 dark:border-white/5 group hover:border-blue-600/10 dark:hover:border-blue-600/20 transition-all"
                        >
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-tighter shadow-sm shrink-0 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                            {opt.skuSuffix || opt.name.slice(0, 2) || '??'}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={opt.name}
                              onChange={e => updateOption(group.id, opt.id, 'name', e.target.value)}
                              placeholder="Option name"
                              className="text-sm font-black text-black dark:text-white uppercase tracking-tight bg-transparent border-b border-transparent focus:border-gray-200 dark:focus:border-white/10 outline-none w-full transition-all"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={opt.stock}
                                onChange={e => updateOption(group.id, opt.id, 'stock', e.target.value)}
                                placeholder="0"
                                className="w-16 text-[10px] text-gray-400 font-bold bg-transparent outline-none"
                              />
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">units</span>
                            </div>
                          </div>
                          <div className="relative flex items-center">
                            <span className="absolute left-4 text-gray-400 font-black text-xs">$</span>
                            <input
                              type="text"
                              value={opt.price}
                              onChange={e => updateOption(group.id, opt.id, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-28 pl-8 pr-4 py-3 bg-[#f3f6ff] dark:bg-black border border-transparent dark:border-white/5 rounded-xl text-sm font-black text-black dark:text-white focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                            />
                          </div>
                          <button
                            onClick={() => removeOption(group.id, opt.id)}
                            className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {group.options.length === 0 && (
                      <div
                        onClick={() => addVariantOption(group.id)}
                        className="py-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px] text-center text-gray-300 dark:text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:border-blue-600/20 hover:text-blue-400 transition-all"
                      >
                        + Add first option
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={addVariantGroup}
              className="w-full py-5 bg-white dark:bg-white/5 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[24px] text-gray-400 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:border-blue-600/30 hover:text-blue-600 transition-all shadow-sm"
            >
              <Plus size={18} />
              {t('products.add_variant_group')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
