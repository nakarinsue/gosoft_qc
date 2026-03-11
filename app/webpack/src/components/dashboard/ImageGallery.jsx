import React from 'react';
import { ImageIcon, Eye } from 'lucide-react';

export default function ImageGallery({ images = [], onPreview }) {
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <ImageIcon className="text-slate-300 dark:text-slate-600 mb-2" size={32} />
        <span className="text-xs text-slate-400">No images attached</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((img, idx) => (
        <div 
          key={idx} 
          onClick={() => onPreview(img.image_url)}
          className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer bg-slate-100 dark:bg-slate-800"
        >
          <img src={img.image_url} alt="Evidence" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => e.target.src='https://placehold.co/400?text=Error'} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="text-white" />
          </div>
        </div>
      ))}
    </div>
  );
}