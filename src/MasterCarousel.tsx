import { useEffect, useRef, useState } from 'react';

/* Классическая карусель: мягкое перетекание + медленное приближение кадра.
   Переключение само раз в 3 с, стрелки, счётчик, свайп на телефоне. */

const PHOTOS = Array.from({ length: 9 }, (_, i) => `/master/c${i + 1}.jpg`);
const BASE = import.meta.env.BASE_URL;
const url = (p: string) => (p.startsWith('/') ? BASE + p.slice(1) : p);
const webp = (p: string) => p.replace(/\.jpg$/, '.webp');
const MS = 3000;

export default function MasterCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef({ x: 0, active: false });

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex(i => (i + 1) % PHOTOS.length), MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const step = (dir: number) => setIndex(i => (i + dir + PHOTOS.length) % PHOTOS.length);

  return (
    <div className="mcar" onPointerEnter={() => setPaused(true)} onPointerLeave={() => { setPaused(false); touch.current.active = false; }}
      onPointerDown={e => { touch.current = { x: e.clientX, active: true }; }}
      onPointerUp={e => {
        if (!touch.current.active) return;
        const dx = e.clientX - touch.current.x;
        touch.current.active = false;
        if (Math.abs(dx) > 44) step(dx > 0 ? -1 : 1);
      }}
      role="region" aria-label="Кадры работ мастерской">
      <div className="mcar-stage">
        {PHOTOS.map((src, i) => (
          <div key={src} className={`mcar-slide ${i === index ? 'is-on' : ''}`} aria-hidden={i !== index}>
            <picture>
              <source type="image/webp" srcSet={url(webp(src))} />
              <img src={url(src)} alt="Работа мастерской «Илья кухни» — кухня и мебель на заказ" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            </picture>
          </div>
        ))}
        <div className="mcar-shade" aria-hidden="true" />
      </div>
      <div className="mcar-ui">
        <span className="mcar-count"><b>{String(index + 1).padStart(2, '0')}</b><i /><span>{String(PHOTOS.length).padStart(2, '0')}</span></span>
        <div className="mcar-buttons">
          <button type="button" onClick={() => step(-1)} aria-label="Предыдущий кадр"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" onClick={() => step(1)} aria-label="Следующий кадр"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
      <span className="mcar-bar" key={index} aria-hidden="true" />
    </div>
  );
}
