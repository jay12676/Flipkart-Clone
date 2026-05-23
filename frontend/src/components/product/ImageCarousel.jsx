import { useState } from 'react';

export default function ImageCarousel({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center bg-flipBg text-flipMuted">
        No image
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((img, i) => (
          <button
            key={img.id ?? i}
            type="button"
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => setActiveIndex(i)}
            className={`h-14 w-14 border bg-white p-1 transition ${
              i === activeIndex ? 'border-flipBlue' : 'border-flipBorder'
            }`}
            aria-label={`Image ${i + 1}`}
          >
            <img src={img.url} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>

      <div className="flex h-96 flex-1 items-center justify-center border border-flipBorder bg-white p-4">
        <img src={active.url} alt="" className="max-h-full max-w-full object-contain" />
      </div>
    </div>
  );
}
