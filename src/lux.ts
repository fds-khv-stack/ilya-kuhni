/* Люкс-интерактив: курсор, магнитные кнопки, параллакс, счётчики, лесенка появления.
   Подключается один раз из main.tsx. Всё отключается при prefers-reduced-motion. */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;

/* ---------- прелоадер: прячем после загрузки (минимум 900 мс) ---------- */
function initIntro() {
  const intro = document.querySelector<HTMLElement>('.intro');
  if (!intro) return;
  const started = performance.now();
  const hide = () => {
    const wait = Math.max(0, 900 - (performance.now() - started));
    window.setTimeout(() => {
      intro.style.opacity = '0';
      intro.style.visibility = 'hidden';
      intro.style.transition = 'opacity .7s cubic-bezier(.22,.61,.36,1)';
      document.body.classList.add('is-ready');
    }, wait);
  };
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide, { once: true });
}

/* ---------- магнитные кнопки: притягиваются к курсору на несколько пикселей ---------- */
function initMagnetic() {
  if (!fine || reduce) return;
  const targets = document.querySelectorAll<HTMLElement>('.button-primary, .header-cta, .circle-arrow, .modal-channels button');
  targets.forEach(el => {
    const strength = 7;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `translate3d(${(dx * strength).toFixed(2)}px, ${(dy * strength).toFixed(2)}px, 0)`;
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}

/* ---------- параллакс: фото героя и полосы секций едут медленнее страницы ---------- */
function initParallax() {
  if (reduce) return;
  const items: { el: HTMLElement; k: number }[] = [];
  document.querySelectorAll<HTMLElement>('.hero-media, .master-photo, .process-section .step-photo, .parallax-media')
    .forEach((el, i) => items.push({ el, k: i === 0 ? -0.06 : -0.035 }));
  if (!items.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    items.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2 - vh / 2;
      const shift = Math.max(-26, Math.min(26, -center * k));
      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ---------- лесенка появления заголовков секций ---------- */
function initStagger() {
  const heads = document.querySelectorAll<HTMLElement>('.section-heading, .contact-heading, .gallery-head');
  if (!heads.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    heads.forEach(h => h.classList.add('stagger', 'is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.2 });
  heads.forEach(h => { h.classList.add('stagger'); io.observe(h); });
}

/* ---------- счётчики: цифры в подписях набегают при появлении ---------- */
function initCounters() {
  if (reduce || !('IntersectionObserver' in window)) return;
  const nodes = [...document.querySelectorAll<HTMLElement>('.cat-count, .portfolio-count, .hero-bottom b')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement;
      io.unobserve(el);
      const src = el.textContent ?? '';
      const m = src.match(/(\d+)/);
      if (!m) return;
      const target = Number(m[1]);
      if (!Number.isFinite(target) || target < 5) return;
      const t0 = performance.now();
      const dur = 900;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = src.replace(m[1], String(Math.round(target * eased)));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = src;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  nodes.forEach(n => io.observe(n));
}

export function initLux() {
  initIntro();
  initMagnetic();
  initParallax();
  initStagger();
  initCounters();
}
