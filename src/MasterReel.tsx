import { useCallback, useEffect, useRef, useState } from 'react';

/* Карусель-арка: карточки едут по дуге, крайние мягко истончаются и заваливаются.
   Бесконечная в обе стороны, тянется пальцем и мышью, доводится инерцией до целого шага. */

const PHOTOS = Array.from({ length: 9 }, (_, i) => `/master/c${i + 1}.jpg`);
const BASE = import.meta.env.BASE_URL;
const url = (p: string) => (p.startsWith('/') ? BASE + p.slice(1) : p);
const webp = (p: string) => p.replace(/\.jpg$/, '.webp');

export default function MasterReel() {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLDivElement | null>>([]);
  const pos = useRef(0);
  const target = useRef(0);
  const step = useRef(1);
  const raf = useRef(0);
  const hovered = useRef(false);
  const drag = useRef({ active: false, lastX: 0, vel: 0, moved: 0 });
  const lastShown = useRef(0);
  const [current, setCurrent] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const n = PHOTOS.length;
  const delta = (i: number, o: number) => {
    let d = i - o;
    d = ((d % n) + n) % n;
    return d > n / 2 ? d - n : d;
  };

  const paint = useCallback(() => {
    const box = wrap.current;
    if (!box) return;
    const W = box.clientWidth;
    const H = box.clientHeight;
    const cw = Math.max(150, Math.min(W * 0.74, H * 0.58));
    const ch = cw * 1.24;
    step.current = cw * 0.5;
    cards.current.forEach((card, i) => {
      if (!card) return;
      // k > 0 — карта в колоде; k < 0 — та, что улетает вправо
      let k = i - pos.current;
      const flying = k < 0 && k > -0.45;
      if (k < -0.45) k += n;
      card.style.width = `${cw}px`;
      card.style.height = `${ch}px`;
      if (flying) {
        const p = Math.min(1, -k / 0.45);
        card.style.transform = `translate(calc(-50% + ${(p * cw * 0.78).toFixed(2)}px), calc(-50% + ${(-p * ch * 0.05).toFixed(2)}px)) rotate(${(p * 15).toFixed(2)}deg) scale(${(1 - p * 0.05).toFixed(3)})`;
        card.style.opacity = String(Math.max(0, 1 - p * 1.5));
        card.style.filter = 'none';
        card.style.zIndex = '320';
        return;
      }
      const x = k * cw * 0.052;
      const y = -k * cw * 0.03;
      const rot = k * 3;
      const sc = Math.max(0.72, 1 - k * 0.038);
      card.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      card.style.opacity = k > 4.6 ? '0' : String(Math.max(0, 1 - k * 0.16));
      card.style.filter = k > 0.6 ? `brightness(${(1 - k * 0.12).toFixed(2)})` : 'none';
      card.style.zIndex = String(300 - Math.round(k * 20));
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = target.current - pos.current;
      pos.current += Math.abs(diff) < 0.0008 ? diff : diff * 0.11;
      paint();
      const near = ((Math.round(pos.current) % n) + n) % n;
      if (near !== lastShown.current) { lastShown.current = near; setCurrent(near); }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const ro = new ResizeObserver(() => paint());
    if (wrap.current) ro.observe(wrap.current);
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, [paint, n]);

  // Автоход: останавливается под курсором, при перетаскивании и при reduced-motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (hovered.current || drag.current.active) return;
      target.current += 1;
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const go = (dir: number) => { target.current += dir; };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // клик по кнопкам не должен превращаться в перетаскивание:
    // setPointerCapture на контейнере съедает click у кнопки
    if ((e.target as HTMLElement).closest('.reel-buttons')) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    drag.current = { active: true, lastX: e.clientX, vel: 0, moved: 0 };
    setGrabbing(true);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.moved += Math.abs(dx);
    drag.current.vel = -dx / step.current;
    target.current += -dx / step.current;
  };
  const onUp = () => {
    if (!drag.current.active) return;
    target.current = Math.round(target.current + drag.current.vel * 7);
    drag.current.active = false;
    setGrabbing(false);
  };

  const focusCard = (i: number) => {
    const d = delta(i, pos.current);
    if (Math.abs(d) < 0.5) return;
    target.current += d;
  };

  return (
    <div className={`master-reel ${grabbing ? 'is-drag' : ''}`} ref={wrap}
      onPointerEnter={() => { hovered.current = true; }}
      onPointerLeave={() => { hovered.current = false; onUp(); }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      role="region" aria-label="Фрагменты работ мастерской">
      <div className="reel-stage">
        {PHOTOS.map((src, i) => (
          <div key={src} className={`reel-card ${i === current ? 'is-on' : ''}`} ref={el => { cards.current[i] = el; }}
            onClick={() => { if (drag.current.moved < 6) focusCard(i); drag.current.moved = 0; }}>
            <picture>
              <source type="image/webp" srcSet={url(webp(src))} />
              <img src={url(src)} alt="Фрагмент работы мастерской «Илья кухни»" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            </picture>
          </div>
        ))}
      </div>
      <div className="reel-chrome">
        <span className="reel-count"><b>0{current + 1}</b><i /><span>0{n}</span></span>
        <div className="reel-buttons">
          <button type="button" onClick={() => go(-1)} aria-label="Предыдущий кадр"><IconArrow /></button>
          <button type="button" onClick={() => go(1)} aria-label="Следующий кадр"><IconArrow /></button>
        </div>
      </div>
      <span className="reel-hint">Тяните в сторону</span>
    </div>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
