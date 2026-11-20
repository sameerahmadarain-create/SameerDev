import React, { useState, useEffect, useRef } from 'react';
import { Project, ScreenshotSource } from '../../types';
import { isValidHttpsUrl, normalizeUrl, deriveProjectName } from '../../services';
import { processImageFile } from '../../utils/imageUpload';
import {
  X,
  Globe,
  Sparkles,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Upload,
  Trash2,
  Tag,
  Link2,
} from 'lucide-react';

export interface ProjectFormSubmitData {
  name: string;
  url: string;
  description?: string;
  screenshot?: string;
  screenshotSource: ScreenshotSource;
  category?: string;
  price?: string;
  technologies?: string[];
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormSubmitData) => Promise<void> | void;
  editingProject?: Project | null;
  isSaving?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProject,
  isSaving = false,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [pictureMode, setPictureMode] = useState<'upload' | 'url'>('upload');
  const [techInput, setTechInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || '');
      setUrl(editingProject.url || '');
      setCategory(editingProject.category || '');
      setPrice(editingProject.price || '');
      setDescription(editingProject.description || '');
      const existingShot = editingProject.screenshot || '';
      setScreenshot(existingShot);
      setPictureMode(existingShot.startsWith('http') ? 'url' : 'upload');
      setTechInput(editingProject.technologies?.join(', ') || '');
      setImageInfo(existingShot.startsWith('data:image') ? 'Uploaded picture attached' : null);
    } else {
      setName('');
      setUrl('');
      setCategory('Product');
      setPrice('');
      setDescription('');
      setScreenshot('');
      setPictureMode('upload');
      setTechInput('');
      setImageInfo(null);
    }
    setFormError(null);
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleUrlBlur = () => {
    if (url.trim() && !name.trim()) {
      const derived = deriveProjectName(url.trim());
      if (derived && derived !== 'New Web Project') {
        setName(derived);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setImageProcessing(true);
    try {
      const processed = await processImageFile(file);
      setScreenshot(processed.dataUrl);
      setImageInfo(`${file.name} (${processed.width}×${processed.height}, ${processed.sizeKb} KB)`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to process image.');
    } finally {
      setImageProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearPicture = () => {
    setScreenshot('');
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName && !trimmedUrl) {
      setFormError('Please enter a Product / Project Name.');
      return;
    }

    if (trimmedUrl && !isValidHttpsUrl(trimmedUrl)) {
      setFormError('If provided, the URL must start with https:// (e.g. https://my-app.netlify.app/).');
      return;
    }

    const normalized = trimmedUrl ? normalizeUrl(trimmedUrl) : '';
    const finalName = trimmedName || deriveProjectName(normalized);
    const trimmedShot = screenshot.trim();

    let screenshotSource: ScreenshotSource = 'fallback';
    if (trimmedShot.startsWith('data:image')) {
      screenshotSource = 'uploaded';
    } else if (trimmedShot) {
      screenshotSource = 'url';
    } else if (normalized) {
      screenshotSource = 'automatic';
    }

    const technologies = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    await onSave({
      name: finalName,
      url: normalized,
      description: description.trim() || undefined,
      screenshot: trimmedShot || undefined,
      screenshotSource,
      category: category.trim() || undefined,
      price: price.trim() || undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
    >
      <div className="relative w-full max-w-xl my-8 rounded-2xl bg-[#140e0b] border border-white/[0.1] shadow-2xl shadow-black/95 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-sky-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{editingProject ? 'Edit Item' : 'New Product / Project'}</span>
            </div>
            <h2 id="project-form-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {editingProject ? 'Edit Product / Project' : 'Add New Product / Project'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product / Project Name */}
          <div className="space-y-1.5">
            <label htmlFor="form-project-name" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Product / Project Name <span className="text-amber-400">*</span>
            </label>
            <input
              id="form-project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smart Fitness Watch, E-Commerce Store"
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              required
            />
          </div>

          {/* Picture Upload or URL */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#0d0907]/80 border border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Product Picture</span>
              </span>

              <div className="inline-flex rounded-lg bg-[#140e0b] p-0.5 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setPictureMode('upload')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    pictureMode === 'upload'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPictureMode('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    pictureMode === 'url'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {pictureMode === 'upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  id="form-product-picture-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!screenshot || !screenshot.startsWith('data:image') ? (
                  <label
                    htmlFor="form-product-picture-file"
                    className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-sky-400/50 bg-[#140e0b]/60 hover:bg-[#1a120e] cursor-pointer transition-all text-center"
                  >
                    {imageProcessing ? (
                      <>
                        <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-stone-300">Optimizing picture...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white">
                            Click to upload product picture
                          </p>
                          <p className="text-[11px] text-stone-400">
                            PNG, JPG, WebP (auto-compressed for fast cloud loading)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                ) : null}
              </div>
            ) : (
              <input
                id="form-project-screenshot"
                type="url"
                value={screenshot.startsWith('data:image') ? '' : screenshot}
                onChange={(e) => {
                  setScreenshot(e.target.value);
                  setImageInfo(null);
                }}
                placeholder="https://example.com/product-photo.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#140e0b] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              />
            )}

            {/* Live Image Preview */}
            {screenshot && (
              <div className="relative rounded-xl overflow-hidden border border-white/[0.1] bg-[#140e0b]">
                <img
                  src={screenshot}
                  alt="Product preview"
                  className="w-full h-44 object-cover object-center"
                />
                <div className="p-2.5 bg-[#0d0907]/90 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-300 truncate">
                    {imageInfo || 'Custom image attached'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {pictureMode === 'upload' && (
                      <label
                        htmlFor="form-product-picture-file"
                        className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Change
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={handleClearPicture}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category + Price row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="form-project-category" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Category <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                id="form-project-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Product, E-Commerce"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form-product-price" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Price / Label <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  id="form-product-price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. Rs. 2,500 or $49"
                  maxLength={40}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Optional: Website / Product URL */}
          <div className="space-y-1.5">
            <label htmlFor="form-project-url" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Website / Demo URL <span className="text-stone-400 font-normal lowercase">(optional HTTPS)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                id="form-project-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (formError) setFormError(null);
                }}
                onBlur={handleUrlBlur}
                placeholder="https://my-app.netlify.app/ (leave blank if product only)"
                maxLength={500}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              />
            </div>
          </div>

          {/* Optional: Technologies / Tags */}
          <div className="space-y-1.5">
            <label htmlFor="form-project-tech" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Features / Technologies <span className="text-stone-400 font-normal lowercase">(comma-separated)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Layers className="w-4 h-4" />
              </div>
              <input
                id="form-project-tech"
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React, TypeScript, Tailwind CSS"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all"
              />
            </div>
          </div>

          {/* Optional: Description */}
          <div className="space-y-1.5">
            <label htmlFor="form-project-description" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Description <span className="text-stone-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="form-project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Brief summary of this product or website..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d0907] border border-white/[0.1] text-sm text-white placeholder-stone-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 transition-all resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] btn-micro-fx disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || imageProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 btn-micro-fx shadow-lg shadow-amber-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingProject ? 'Save Changes' : 'Save Product / Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
