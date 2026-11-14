import React, { useRef, useState, useEffect, useId } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

// Client-side auto-compressor with strict 1000ms timeout fallback to prevent any stalling
const compressImage = (dataUrl, maxWidth = 1000, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    // Safety timeout: resolve with raw dataUrl if canvas operations take >1000ms
    const timer = setTimeout(() => {
      resolve(dataUrl);
    }, 1000);

    try {
      const img = new Image();
      img.onload = () => {
        clearTimeout(timer);
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch {
      clearTimeout(timer);
      resolve(dataUrl);
    }
  });
};

export default function FileUpload({ 
  label = "Upload GCash Receipt", 
  accept = "image/*", 
  onFileSelect, 
  initialPreview = null,
  helperText = ""
}) {
  const generatedId = useId();
  const inputId = `file-upload-${generatedId.replace(/:/g, '')}`;
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(initialPreview);
  const [fileMeta, setFileMeta] = useState(null);

  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const meta = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type
    };
    setFileMeta(meta);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const rawDataUrl = reader.result;
      if (!rawDataUrl) return;

      const compressed = await compressImage(rawDataUrl);
      const finalDataUrl = compressed || rawDataUrl;
      setPreview(finalDataUrl);
      if (onFileSelect) {
        onFileSelect({ file, dataUrl: finalDataUrl, preview: finalDataUrl, meta });
      }
    };
    reader.onerror = () => {
      console.warn('[FileUpload] FileReader read failed');
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setFileMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full">
      <input 
        id={inputId}
        ref={fileInputRef}
        type="file" 
        accept={accept}
        onChange={handleFileChange}
        className="sr-only" 
      />

      {!preview ? (
        <label 
          htmlFor={inputId}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          className="border-2 border-dashed border-slate-300 hover:border-[#14532D] bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 text-center cursor-pointer transition shadow-2xs group flex flex-col items-center justify-center select-none"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto mb-2 text-[#14532D] group-hover:scale-110 transition pointer-events-none">
            <Camera className="w-5 h-5 text-[#14532D]" />
          </div>
          <p className="text-xs font-bold text-slate-800 pointer-events-none">{label}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 pointer-events-none">
            {helperText || "Tap to browse device photos or snap screenshot"}
          </p>
        </label>
      ) : (
        <div className="border border-emerald-200 bg-[#ECFDF5] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={preview} 
              alt="Receipt Screenshot Preview" 
              className="w-14 h-14 rounded-xl object-cover border border-emerald-300 shrink-0 bg-white shadow-xs" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14532D]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">{fileMeta?.name || 'Receipt Attached'}</span>
              </div>
              <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                {fileMeta?.size || 'Image Ready'} · Ready for landlord verification
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={clearFile}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition cursor-pointer shrink-0 ml-2 shadow-2xs"
            title="Remove receipt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
