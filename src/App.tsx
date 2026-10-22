import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { sections } from './data/gallery';
import type { GallerySection } from './data/gallery';

const HERO_MS = 4000;
const TILE_MS = 2000;
const HERO_IMAGES = ['/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg', '/images/hero-4.jpg', '/images/hero-5.jpg', '/images/hero-6.jpg', '/images/hero-7.jpg', '/images/hero-8.jpg', '/images/hero-9.jpg'];
const delay = (ms: number): CSSProperties => ({ ['--d' as string]: `${ms}ms` });
// WebP-версии генерирует scripts/make_webp.py: <имя>.webp (полный) и <имя>-sm.webp (700 px для плиток).
// На GitHub Pages сайт живёт в подпапке (/ilya-kuhni/), поэтому все пути идут через BASE_URL.
const asset = (p: string) => (p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p);
const toWebp = (src: string, light = true) => src.replace(/\.(jpe?g)$/i, (light ? '-sm' : '') + '.webp');
function Pic({ src, alt, className, light = true, loading = 'lazy', fetchPriority, onClick }: { src: string; alt: string; className?: string; light?: boolean; loading?: 'lazy' | 'eager'; fetchPriority?: 'high' | 'auto'; onClick?: (e: ReactMouseEvent<HTMLImageElement>) => void }) {
  const url = asset(src);
  return <picture><source type="image/webp" srcSet={toWebp(url, light)} /><img src={url} alt={alt} className={className} loading={loading} decoding="async" fetchPriority={fetchPriority} onClick={onClick} /></picture>;
}


type IconName = 'arrow' | 'diagonal' | 'pin' | 'close' | 'menu' | 'check' | 'ruler' | 'hand' | 'leaf' | 'telegram' | 'whatsapp' | 'max' | 'phone' | 'plus';
function Icon({ name, size = 20, ...props }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    diagonal: <><path d="M5 19 19 5M5 5h14v14" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 8h16M4 16h16" />,
    check: <path d="m5 12 4 4L19 6" />,
    ruler: <><path d="m4 16 12-12 5 5L9 21 4 16Z" /><path d="m12 8 2 2m-6 2 2 2m6-10 2 2" /></>,
    hand: <><path d="M4 12h3l3-3a3 3 0 0 1 4 0l5 4-5 6a3 3 0 0 1-4 0l-4-4H3M17 7l4 2v7h-3M3 8h4l3 2M11 14l4 3" /></>,
    leaf: <><path d="M20 4C9 2 3 8 6 15s16 3 14-11Z" /><path d="M4 21 16 9" /></>,
    telegram: <><path d="m3 11 18-7-4 16-6-5-4 3v-6l10-5-7 8" /></>,
    whatsapp: <><path d="M20 11.5a8 8 0 0 1-12 7L3 20l1.5-5A8 8 0 1 1 20 11.5Z" /><path d="M8 7c-1 4 2 7 6 8l2-2-3-2-1 1-2-2 1-1-2-2H8Z" /></>,
    max: <><path d="M20 11a8 8 0 0 1-12 7l-5 2 1-6A8 8 0 1 1 20 11Z" /><path d="M8 14V9l4 3 4-3v5" /></>,
    phone: <path d="m8 3 3 5-3 3a16 16 0 0 0 5 5l3-3 5 3-1 4c-1 3-9-1-13-5S0 4 3 3h5Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
const channels: { name: string; icon: IconName; subtitle: string; href?: string }[] = [
  { name: 'Telegram', icon: 'telegram', subtitle: 'Написать в Telegram', href: 'https://t.me/Dmitrii_khv27' },
  { name: 'WhatsApp', icon: 'whatsapp', subtitle: 'Обсудить детали', href: 'https://wa.me/79147719148' },
  { name: 'Max', icon: 'max', subtitle: 'Начать разговор' },
  { name: 'Позвонить', icon: 'phone', subtitle: '+7 914 771-91-48', href: 'tel:+79147719148' },
];
const services = [
  { title: 'Кухни', value: 'Кухня', image: '/gallery/kuhni/p2.jpg', description: 'Место, где начинается ваш день. Продуманное до мелочей.' },
  { title: 'Шкафы', value: 'Шкаф / гардеробная', image: '/gallery/shkafy/p3.jpg', description: 'Порядок снаружи и внутри. Для каждой вещи — своё место.' },
  { title: 'Гостиные', value: 'Мебель для гостиной', image: '/gallery/tumby/p1.jpg', description: 'Пространство, в котором хочется остаться. И быть собой.' },
];
const marqueeItems = [0, 1].flatMap(dup => sections.map(s => ({ dup, title: s.title, slug: s.slug })));
function Brand({ light = false }: { light?: boolean }) {
  return <a href="#home" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Илья кухни — на главную"><span className="brand-name">илья<span className="brand-dot">.</span><span className="brand-kitchen">кухни</span></span><span className="brand-caption">Мастерская авторской мебели</span></a>;
}
function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = ref.current?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex="0"]');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={e => e.stopPropagation()}><button className="modal-close icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>{children}</div></div>;
}
// Плитка раздела: кроссфейд-смена фото при наведении (двойная буферизация — в DOM максимум 2 фото).
function CatCard({ section, delayMs, onOpen }: { section: GallerySection; delayMs: number; onOpen: () => void }) {
  const photos = section.photos;
  const n = photos.length;
  const [buf, setBuf] = useState({ active: 0, idx: [0, n > 1 ? 1 : 0] });
  const timer = useRef<number | null>(null);
  const stop = () => { if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; } };
  const start = () => {
    if (n < 2 || timer.current !== null) return;
    timer.current = window.setInterval(() => setBuf(prev => {
      const hidden = prev.active === 0 ? 1 : 0;
      const idx = prev.idx.slice();
      idx[hidden] = (prev.idx[prev.active] + 1) % n;
      return { active: hidden, idx };
    }), TILE_MS);
  };
  const reset = () => { stop(); setBuf({ active: 0, idx: [0, n > 1 ? 1 : 0] }); };
  useEffect(() => stop, []);
  const style: CSSProperties = { ...delay(delayMs), ...(section.focus ? { ['--focus' as string]: section.focus } : {}), transition: 'opacity .9s var(--ease),transform .6s var(--ease),filter .9s var(--ease),box-shadow .6s var(--ease)', transitionDelay: 'var(--d,0ms)' };
  return <button type="button" className="cat-card" data-reveal style={style} onMouseEnter={start} onMouseLeave={reset} onFocus={start} onBlur={reset} onClick={onOpen} aria-label={`${section.title} — ${section.count} фото, открыть каталог`}>
    <Pic className={buf.active === 0 ? 'is-on' : ''} src={photos[buf.idx[0]]} alt={`${section.title} — фото ${buf.idx[0] + 1}`} />
    {n > 1 && <Pic className={buf.active === 1 ? 'is-on' : ''} src={photos[buf.idx[1]]} alt={`${section.title} — фото ${buf.idx[1] + 1}`} />}
    <span className="cat-shade" />
    <div className="cat-copy"><div><span className="cat-name">{section.title}</span><span className="cat-count">{section.count} фото</span></div><span className="circle-arrow"><Icon name="diagonal" size={18} /></span></div>
  </button>;
}
// Окно раздела: сетка всех фото + лайтбокс: стрелки на десктопе, свайп на телефоне, Esc для закрытия.
function SectionModal({ section, onClose }: { section: GallerySection; onClose: () => void }) {
  const n = section.photos.length;
  const [photo, setPhoto] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ x: 0, y: 0, active: false, moved: false, dx: 0 });
  const swiped = useRef(false);

  const step = (dir: number) => setPhoto(v => (v === null ? v : (v + dir + n) % n));

  useEffect(() => {
    if (photo === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); setPhoto(null); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setPhoto(v => (v === null ? v : (v + 1) % n)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setPhoto(v => (v === null ? v : (v - 1 + n) % n)); }
    };
    document.addEventListener('keydown', key, true);
    return () => document.removeEventListener('keydown', key, true);
  }, [photo, n]);

  /* Свайп: кадр идёт за пальцем, на отпускании — листание или мягкий возврат */
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, active: true, moved: false, dx: 0 };
    swiped.current = false;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* синтетические события без активного указателя */ }
    if (stage.current) stage.current.style.transition = 'none';
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      d.moved = true;
    }
    d.dx = dx;
    if (stage.current) stage.current.style.transform = `translateX(${dx}px)`;
  };
  const onUp = () => {
    const d = drag.current;
    d.active = false;
    if (stage.current) {
      stage.current.style.transition = '';
      stage.current.style.transform = '';
    }
    if (d.moved && Math.abs(d.dx) > 44) {
      swiped.current = true;
      step(d.dx < 0 ? 1 : -1);
      // снимаем «глушилку» клика по таймауту: иначе первый осознанный тап по фону проглатывался
      window.setTimeout(() => { swiped.current = false; }, 350);
    }
    d.moved = false;
  };

  return <Modal onClose={onClose} title={section.title}>
    <div className="modal-content">
      <div className="gallery-head">
        <div><div className="eyebrow">Каталог мастерской</div><h2>{section.title}</h2></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          <span className="portfolio-count">{section.count} фото</span>
          <button className="button button-outline" onClick={onClose}>Закрыть</button>
        </div>
      </div>
      <div className="gallery-grid">
        {section.photos.map((src, i) => <Pic key={src} src={src} alt={`${section.title} — фото ${i + 1}`} onClick={() => setPhoto(i)} />)}
      </div>
    </div>
    {photo !== null && <div className="lightbox" onClick={() => { if (swiped.current) { swiped.current = false; return; } setPhoto(null); }}>
      <div className="lightbox-stage" ref={stage}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClick={e => e.stopPropagation()}>
        <Pic src={section.photos[photo]} alt={`${section.title} — фото ${photo + 1}`} light={false} loading="eager" />
      </div>
      <button className="lightbox-nav-btn prev" onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Предыдущее фото"><Icon name="arrow" size={22} className="flip" /></button>
      <button className="lightbox-nav-btn next" onClick={e => { e.stopPropagation(); step(1); }} aria-label="Следующее фото"><Icon name="arrow" size={22} /></button>
      <button className="lightbox-close icon-button" onClick={() => setPhoto(null)} aria-label="Закрыть фото"><Icon name="close" /></button>
      <div className="lightbox-bar">
        <span className="lightbox-count">{String(photo + 1).padStart(2, '0')} <i /> {String(n).padStart(2, '0')}</span>
        <span className="lightbox-hint hint-keys">← → · Esc</span>
        <span className="lightbox-hint hint-swipe">Свайп · тап — закрыть</span>
      </div>
    </div>}
  </Modal>;
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const [megaOn, setMegaOn] = useState(false);

  // Переходы по якорям делаем сами: нативный прыжок по #hash на мобильных терялся
  // (меню закрывалось, страница оставалась на месте), плюс нужен отступ под липкую шапку.
  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Мега-типографика раскрывается при появлении. Класс держим в состоянии:
  // прямой classList React снимает при следующей перерисовке (после заставки)
  useEffect(() => {
    const mega = document.querySelector('.mega-block');
    if (!mega) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { setMegaOn(true); io.unobserve(mega); }
      });
    }, { threshold: 0.3 });
    io.observe(mega);
    return () => io.disconnect();
  }, []);

  // Фото мастера «выходит из темноты»: свет идёт за курсором, на телефоне — по прокрутке
  useEffect(() => {
    const photo = document.querySelector<HTMLElement>('.master-photo');
    const dim = photo?.querySelector<HTMLElement>('.spot-dim');
    if (!photo || !dim) return;
    const onMove = (event: PointerEvent) => {
      const r = photo.getBoundingClientRect();
      dim.style.setProperty('--x', `${event.clientX - r.left}px`);
      dim.style.setProperty('--y', `${event.clientY - r.top}px`);
    };
    const onScroll = () => {
      const r = photo.getBoundingClientRect();
      const p = 1 - Math.min(1, Math.max(0, r.top / window.innerHeight));
      dim.style.setProperty('--x', '50%');
      dim.style.setProperty('--y', `${22 + p * 52}%`);
    };
    if (window.matchMedia('(hover: none)').matches) {
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
    photo.addEventListener('pointermove', onMove);
    return () => photo.removeEventListener('pointermove', onMove);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [intro, setIntro] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [gallery, setGallery] = useState<GallerySection | null>(null);
  const [contact, setContact] = useState(false);
  const [channel, setChannel] = useState('Telegram');
  const [service, setService] = useState('Кухня');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  useEffect(() => {
    const preload = () => HERO_IMAGES.slice(1).forEach(src => { const img = new Image(); img.src = asset(src.replace(/\.jpe?g$/i, '.webp')); });
    if (document.readyState === 'complete') preload();
    else window.addEventListener('load', preload, { once: true });
    return () => window.removeEventListener('load', preload);
  }, []);
  useEffect(() => { const t = window.setTimeout(() => setHeroSlide(s => (s + 1) % HERO_IMAGES.length), HERO_MS); return () => window.clearTimeout(t); }, [heroSlide]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    // заставка уходит — только после этого запускаем подъём строк первого экрана
    const t = window.setTimeout(() => { setIntro(false); document.body.classList.add('is-ready'); }, 2100);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    // .img-reveal-картинки обрезаны clip-path:inset(0 0 100% 0), и Chrome считает
    // площадь пересечения нулевой — observer такую картинку «не видит». Поэтому
    // наблюдаем её родителя, а по его появлению вешаем .is-in на саму картинку.
    const hosts = new Map<Element, Element[]>();
    const boxHost = (el: Element) => {
      const p = el.parentElement;
      // <picture> с display:contents не создаёт бокс — IntersectionObserver его не увидит
      return p && p.tagName === 'PICTURE' ? (p.parentElement ?? p) : p;
    };
    document.querySelectorAll('.img-reveal').forEach(el => {
      const host = boxHost(el);
      if (host) hosts.set(host, [...(hosts.get(host) ?? []), el]);
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      hosts.get(entry.target)?.forEach(el => el.classList.add('is-in'));
      observer.unobserve(entry.target);
    }), { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    hosts.forEach((_, host) => observer.observe(host));
    return () => observer.disconnect();
  }, []);
  const scrollToContact = () => { setMenu(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); };
  const openContact = (selectedChannel = 'Telegram', selectedService = 'Кухня') => { setChannel(selectedChannel); setService(selectedService); setMessage(''); setCopied(false); setContact(true); setMenu(false); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '');
    const connection = String(data.get('connection') || '');
    const task = String(data.get('service') || '');
    const description = String(data.get('description') || '');
    setMessage(`Здравствуйте, Илья! Меня зовут ${name}.
Хочу обсудить проект: ${task}.
${description || 'Детали хотел(а) бы обсудить лично.'}
Удобный способ связи: ${channel}.
Мой контакт: ${connection}.`);
  };
  const download = () => { const url = URL.createObjectURL(new Blob([message], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'Мой проект — Илья кухни.txt'; a.click(); URL.revokeObjectURL(url); };
  return <>
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`} id="home"><div className="header-inner"><Brand /><nav className="desktop-nav" aria-label="Основная навигация"><a href="#portfolio">Наши работы</a><a href="#master">О мастере</a><a href="#services">Что создаём</a><a href="#process">Как работаем</a></nav><button className="header-cta" onClick={scrollToContact}>Обсудить проект <Icon name="diagonal" size={17} /></button><button className="mobile-menu-button icon-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu}><Icon name={menu ? 'close' : 'menu'} /></button></div>{menu && <nav className="mobile-nav" aria-label="Мобильная навигация">{[['#portfolio', 'Наши работы'], ['#master', 'О мастере'], ['#services', 'Что создаём'], ['#process', 'Как работаем'], ['#contact', 'Контакты']].map(([href, text]) => <a key={href} href={href} onClick={() => setMenu(false)}>{text}<Icon name="diagonal" size={18} /></a>)}</nav>}</header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="location"><span className="status-dot" />Частная мастерская · Хабаровск</div><h1 id="hero-title"><span className="line"><span>Авторские кухни</span></span><span className="line"><span>и мебель на заказ</span></span><span className="line"><span className="accent">в Хабаровске</span></span></h1><p className="hero-subtitle">От идеи до установки.<br />Лично от мастера.</p><button className="button button-primary" onClick={scrollToContact}>Обсудить проект<Icon name="diagonal" size={19} /></button><p className="hero-note">Начнём с разговора, а не с договора.</p><div className="hero-bottom"><span className="mini-mark"><Icon name="hand" size={24} /></span><p>Не конвейер. Не типовые решения.<br /><strong>Мебель с вашим характером.</strong></p></div></div>
        <div className="hero-media">{HERO_IMAGES.map((src, i) => <div key={src} className={`hero-slide ${i === heroSlide ? 'is-on' : ''}`} aria-hidden={i !== heroSlide}><Pic src={src} alt={`Мебель на заказ в Хабаровске — работа мастерской, вид ${i + 1}`} light={false} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} /></div>)}<div className="image-top-note"><span />Продумано до последней детали</div><div className="hero-progress"><i key={heroSlide} /></div><button className="image-pagination" onClick={() => setHeroSlide(s => (s + 1) % HERO_IMAGES.length)} aria-label={`Следующий интерьер. Сейчас ${heroSlide + 1} из ${HERO_IMAGES.length}`}><b>0{heroSlide + 1}</b><span />0{HERO_IMAGES.length}</button></div>
        
      </section>
      <section className={megaOn ? 'mega-block is-on' : 'mega-block'} aria-label="О мастерской"><div className="container"><h2 className="mega"><span className="line"><span>Мебель</span></span><span className="line"><span className="fill">с характером</span></span><span className="line"><span className="outline">один мастер</span></span></h2><div className="mega-meta"><span><b>Илья кухни</b> · частная мастерская</span><span>Хабаровск и пригороды</span><span>от эскиза до установки</span></div></div></section>
      <div className="principles container"><div data-reveal style={delay(0)}><Icon name="ruler" size={26} /><span>По вашим размерам.<br /><strong>Под ваш образ жизни.</strong></span></div><div data-reveal style={delay(90)}><Icon name="leaf" size={26} /><span>Материалы, к которым<br /><strong>приятно прикоснуться.</strong></span></div><div data-reveal style={delay(180)}><Icon name="hand" size={26} /><span>Один мастер.<br /><strong>Личная ответственность.</strong></span></div></div>
      <div className="marquee"><div className="marquee-track">{marqueeItems.map(item => <span key={`${item.dup}-${item.slug}`} aria-hidden={item.dup === 1 || undefined}>{item.title}<b> ·</b></span>)}<span aria-hidden="true" /></div></div>
      <section id="portfolio" className="portfolio section container" data-reveal>
        <div className="section-heading"><div><div className="eyebrow">Каждая деталь имеет значение</div><h2 data-reveal>НЕ просто мебель,<br />а часть <span className="mark">ВАШЕЙ</span> жизни</h2></div><p data-reveal>Семь направлений и настоящие работы мастерской.<br className="desktop-break" /> Один подход — создавать как для себя.</p></div>
        <div className="cat-grid">{sections.map((section, i) => <CatCard key={section.slug} section={section} delayMs={(i % 4) * 90} onOpen={() => setGallery(section)} />)}</div>
      </section>
      <section id="master" className="master-section" data-reveal><div className="container master-grid"><div className="master-photo"><Pic className="img-reveal" src="/gallery/kuhni/p5.jpg" alt="Мебель на заказ в Хабаровске — работа мастерской «Илья кухни»" /><span className="spot-dim" aria-hidden="true" /><span className="photo-label">За каждой деталью — человек</span></div><div className="master-copy"><div className="eyebrow">Давайте познакомимся</div><h2 data-reveal>Меня зовут Илья.<br />И я отвечаю<br />за свою работу.</h2><p className="master-intro">«Хорошая мебель не просит внимания.<br />Она просто делает вашу жизнь удобнее».</p><p>Я создаю кухни и мебель под конкретного человека. Сначала слушаю: как вы готовите, что любите, где храните любимые чашки. И только потом предлагаю решения.</p><p>Для меня важны не только фасады на фотографии, но и то, как открывается каждый ящик. Поэтому я лично веду проект — от первого разговора до последней регулировки.</p><div className="master-signoff"><span className="signature">Илья</span><span>Ваш мастер.<br />На каждом этапе.</span></div><a className="text-link" href="#process">Как будет устроена наша работа<Icon name="arrow" size={18} /></a></div></div></section>
      <section id="services" className="section container services" data-reveal><div className="section-heading"><div><div className="eyebrow">В едином стиле с вашим домом</div><h2 data-reveal>Больше, чем кухни.</h2></div><p>Мебель, которая вписывается в пространство.<br />И в вашу жизнь.</p></div><div className="service-grid">{services.map((item, i) => <button key={item.title} className="service-card" data-reveal style={delay((i % 3) * 90)} onClick={() => openContact('Telegram', item.value)}><Pic className="img-reveal" src={item.image} alt={'Мебель на заказ: ' + item.title} /><div className="service-shade" /><div className="service-copy"><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="circle-arrow"><Icon name="diagonal" /></span></div></button>)}</div></section>
      <section id="process" className="process-section section" data-reveal><div className="container"><div className="section-heading"><div><div className="eyebrow">Понятно. Спокойно. По шагам.</div><h2 data-reveal><span className="lead-strong">От первого «здравствуйте»<br />до вашей новой кухни.</span></h2></div><p>Без сложных схем и лишних посредников.<br />На каждом этапе вы общаетесь со мной.</p></div><div className="process-grid">{[{ title: 'Знакомимся', label: 'Заявка', text: 'Обсуждаем вашу идею, привычки и пожелания. Определяем ориентиры по бюджету.' }, { title: 'Продумываем', label: 'Замер', text: 'Изучаем пространство. Вместе выбираем материалы, планировку и каждую деталь.' }, { title: 'Создаём', label: 'Производство', text: 'Изготавливаем мебель по согласованному проекту. Держим вас в курсе процесса.' }, { title: 'Устанавливаем', label: 'Монтаж', text: 'Бережно привозим, собираем и регулируем. Проверяем, чтобы всё работало как надо.' }, { title: 'Остаёмся рядом', label: 'Гарантия', text: 'Не прощаемся после установки. Условия гарантии фиксируем в договоре.' }].map((item, index) => <div className="step" key={item.label} data-reveal style={delay((index % 5) * 90)}><div className="step-top"><span>0{index + 1}</span><small>{item.label}</small></div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>
      <section className="faq-section container" data-reveal><div><div className="eyebrow">Чтобы стало чуть понятнее</div><h2 data-reveal>До первого<br />разговора.</h2></div><div className="faq-list">{[{ q: 'Сколько стоит кухня на заказ?', a: 'Стоимость зависит от размеров, материалов фасадов, столешницы и фурнитуры. Начнём с вашей задачи и комфортного бюджета — после замера и выбора комплектации подготовим индивидуальный расчёт.' }, { q: 'Можно прийти со своим дизайн-проектом?', a: 'Конечно. Можно прислать готовый проект, план квартиры или просто фотографии, которые вам нравятся. Обсудим, как воплотить идею и сделать мебель удобной именно для вас.' }, { q: 'Какие сроки изготовления?', a: 'Срок зависит от объёма проекта и доступности материалов. Точную дату согласуем до начала работ и зафиксируем в договоре. Если у вас есть важная дата, расскажите о ней при первом разговоре.' }, { q: 'Работаете только в Хабаровске?', a: 'Основное направление — Хабаровск и пригород. Если ваш объект находится дальше, напишите о нём: возможность замера, доставки и монтажа обсудим индивидуально.' }].map(item => <details key={item.q}><summary>{item.q}<Icon name="plus" size={20} /></summary><p>{item.a}</p></details>)}</div></section>
      <section id="contact" className="contact-section" data-reveal><div className="container"><div className="contact-heading"><div className="eyebrow"><span className="status-dot" />Хорошая мебель начинается с разговора</div><h2 data-reveal>Готовы обсудить<br />вашу мебель?</h2><p>Расскажите, какой вы её представляете.<br />Я помогу с остальным.</p></div><div className="channel-grid">{channels.map((item, i) => {
        const inner = <><Icon name={item.icon} size={29} /><div><strong>{item.name}</strong><span>{item.subtitle}</span></div><Icon name="diagonal" size={20} /></>;
        const key = item.name, style = delay((i % 4) * 90);
        return item.href
          ? <a key={key} className="channel-card" data-reveal style={style} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{inner}</a>
          : <button key={key} className="channel-card" data-reveal style={style} onClick={() => openContact(item.name)}>{inner}</button>;
      })}</div><div className="contact-bottom"><span><Icon name="pin" size={15} />Хабаровск и пригород</span><a href="tel:+79147719148" style={{ color: 'var(--brass-soft)', letterSpacing: '.04em' }}>+7 914 771-91-48</a><span>Общение напрямую с мастером. Без менеджеров.</span></div></div></section>
    </main>
    <footer className="footer container"><div className="footer-top"><Brand /><div className="footer-links"><a href="#portfolio">Наши работы</a><a href="#master">О мастере</a><a href="#contact">Контакты</a></div><a href="#home" className="back-top">Наверх <Icon name="arrow" size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Илья кухни. Сделано с вниманием.</span><button onClick={() => setPrivacy(true)}>Конфиденциальность</button><span>Авторская мебель. Личный подход.</span></div><p style={{ marginTop: '14px', fontSize: '10px', color: '#969a8f' }}>Сайт разработан <a href="https://t.me/Dmitrii_khv27" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Дмитрием — сайты и ИИ-системы · @Dmitrii_khv27</a></p></footer>
    {gallery && <SectionModal section={gallery} onClose={() => setGallery(null)} />}
    {intro && <div className="intro"><div className="intro-mark">илья<span>.</span>кухни</div><div className="intro-line" /><small>мастерская авторской мебели</small></div>}
    <div className="site-grain" />
    {contact && <Modal onClose={() => setContact(false)} title="Обсудить проект"><div className="modal-content contact-modal"><div className="eyebrow">Первый шаг к вашей мебели</div><h2>{message ? 'Начало положено.' : 'Давайте знакомиться.'}</h2>{!message ? <><p>Пара слов о вашей идее — и у нас уже будет отправная точка для разговора.</p><div className="modal-channels">{channels.map(item => <button key={item.name} type="button" className={channel === item.name ? 'selected' : ''} onClick={() => setChannel(item.name)} aria-pressed={channel === item.name}><Icon name={item.icon} size={17} />{item.name}</button>)}</div><form onSubmit={submit}><div className="form-row"><label>Как к вам обращаться<input name="name" placeholder="Ваше имя" required maxLength={80} autoComplete="given-name" /></label><label>{channel === 'Позвонить' || channel === 'WhatsApp' ? 'Номер телефона' : 'Телефон или никнейм'}<input name="connection" placeholder={channel === 'Telegram' ? '@username или +7…' : '+7…'} required minLength={5} maxLength={100} autoComplete="tel" /></label></div><label>Что хотите создать<select name="service" value={service} onChange={e => setService(e.target.value)}><option>Кухня</option><option>Шкаф / гардеробная</option><option>Мебель для гостиной</option><option>Несколько предметов мебели</option></select></label><label>Расскажите об идее <span className="optional">необязательно</span><textarea name="description" placeholder="Размеры, стиль, материалы или то, что для вас важно…" rows={3} maxLength={2000} /></label><button className="button button-primary form-submit" type="submit">Подготовить сообщение<Icon name="arrow" /></button><p className="fine-print">Сайт сформирует готовый текст заявки — останется отправить его Илье в удобном мессенджере. Данные никуда не передаются и не сохраняются.</p></form></> : <>
          <p>Сообщение готово. Отправьте его Илье удобным способом — или просто позвоните.</p>
          <pre className="message-preview">{message}</pre>
          <div className="result-actions">
            <button className="button button-primary" onClick={async () => { try { await navigator.clipboard.writeText(message); setCopied(true); } catch { download(); } }}>{copied ? 'Скопировано' : 'Скопировать'}<Icon name={copied ? 'check' : 'arrow'} /></button>
            <a className="button button-outline" href={`https://t.me/share/url?url=${encodeURIComponent('https://fds-khv-stack.github.io/ilya-kuhni/')}&text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Открыть Telegram</a>
            <button className="button button-outline" onClick={download}>Скачать .txt</button>
          </div>
          <p role="status" className="fine-print">{copied ? 'Сообщение в буфере обмена. ' : ''}Или напишите напрямую: <a href="https://wa.me/79147719148" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brass-soft)' }}>WhatsApp</a> · <a href="tel:+79147719148" style={{ color: 'var(--brass-soft)' }}>+7 914 771-91-48</a>.</p>
          <button className="text-link" onClick={() => { setMessage(''); setCopied(false); }}>Создать другое сообщение</button></>}</div></Modal>}
    {privacy && <Modal onClose={() => setPrivacy(false)} title="Конфиденциальность"><div className="modal-content"><div className="eyebrow">Ваши данные</div><h2>Конфиденциальность</h2><p>Этот сайт — интерактивная дизайн-концепция мастерской «Илья кухни». Поля формы обрабатываются только в вашем браузере: информация не передаётся на сервер и не сохраняется после закрытия страницы.</p><p>При нажатии «Скопировать» текст помещается в буфер обмена по вашему запросу. При нажатии «Скачать» создаётся текстовый файл на вашем устройстве.</p><p>Все фотографии загружаются с этого же сайта. Для отображения шрифтов браузер обращается к Google Fonts. Аналитика и рекламные cookies не используются.</p><p className="fine-print">Перед запуском сайта эта информация должна быть заменена политикой реального оператора персональных данных.</p></div></Modal>}
  </>;
}
