import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageGalleryModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 select-none">
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Zoom Button */}
      <button
        onClick={() => setZoomed(!zoomed)}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
      >
        {zoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image Display */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center relative p-4">
        <img
          src={currentImage.image_url || currentImage}
          alt={currentImage.caption || 'معرض الأعمال'}
          className={`max-w-full max-h-[75vh] object-contain rounded-2xl transition-transform duration-300 ${
            zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setZoomed(!zoomed)}
        />
        {currentImage.caption && (
          <p className="mt-4 text-white text-center font-bold text-sm bg-slate-900/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
            {currentImage.caption}
          </p>
        )}
        <p className="mt-2 text-slate-400 text-xs font-semibold">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

    </div>
  );
}
