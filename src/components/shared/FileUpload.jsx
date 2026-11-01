import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

export default function FileUpload({ 
  label = "Upload Document", 
  accept = "image/*", 
  onFileSelect, 
  initialPreview = null,
  helperText = ""
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(initialPreview);
  const [fileMeta, setFileMeta] = useState(null);

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
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      if (onFileSelect) {
        onFileSelect({ file, dataUrl, meta });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      <input 
        ref={fileInputRef}
        type="file" 
        accept={accept}
        onChange={handleFileChange}
        className="hidden" 
      />

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#14532D] bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-4 text-center cursor-pointer transition shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto mb-2 text-[#14532D] group-hover:scale-110 transition">
            <Camera className="w-5 h-5 text-[#14532D]" />
          </div>
          <p className="text-xs font-bold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {helperText || "Click to browse device photos or snap with camera"}
          </p>
        </div>
      ) : (
        <div className="border border-emerald-200 bg-[#ECFDF5] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={preview} 
              alt="Upload Preview" 
              className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0 bg-white" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14532D]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileMeta?.name || 'File Attached'}</span>
              </div>
              <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                {fileMeta?.size || 'Image Ready'} · Ready for verification
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={clearFile}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition cursor-pointer shrink-0 ml-2 shadow-2xs"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
