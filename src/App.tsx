import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { sections } from './data/gallery';
import type { GallerySection } from './data/gallery';
import { CONTACT } from './data/contact';

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
const services = [
  { title: 'Кухни', value: 'Кухня', image: '/gallery/kuhni/p2.jpg', description: 'Место, где начинается ваш день. Продуманное до мелочей.' },
  { title: 'Шкафы', value: 'Шкаф / гардеробная', image: '/gallery/shkafy/p3.jpg', description: 'Порядок снаружи и внутри. Для каждой вещи — своё место.' },
  { title: 'Гостиные', value: 'Мебель для гостиной', image: '/gallery/tumby/p1.jpg', description: 'Пространство, в котором хочется остаться. И быть собой.' },
];
function Brand({ light = false }: { light?: boolean }) {
  return <a href="#home" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Илья кухни — на главную"><span className="brand-name">илья<span className="brand-dot">.</span><span className="brand-kitchen">кухни</span></span><span className="brand-caption">Мастерская авторской мебели</span></a>;
}
function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <button className="modal-close icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>{children}
  </dialog>;
}
function CatCard({ section, delayMs, onOpen }: { section: GallerySection; delayMs: number; onOpen: () => void }) {
  return <button type="button" className="cat-card" data-reveal style={delay(delayMs)} onClick={onOpen} aria-label={`${section.title} — ${section.photos.length} фото, открыть каталог`}>
    <Pic className="is-on" src={section.slug === 'kuhni' ? '/gallery/kuhni/p2.jpg' : section.photos[0]} alt={`${section.title} на заказ — работа мастерской`} />
    <span className="cat-shade" />
    <span className="cat-copy"><span><span className="cat-name">{section.title}</span><span className="cat-count">{section.photos.length} фото</span></span><span className="circle-arrow"><Icon name="diagonal" size={18} /></span></span>
  </button>;
}
function SectionModal({ section, onClose }: { section: GallerySection; onClose: () => void }) {
  const n = section.photos.length;
  const [photo, setPhoto] = useState<number | null>(null);
  const photoTrigger = useRef<HTMLButtonElement | null>(null);
  const back = useRef<HTMLButtonElement>(null);
  const viewingPhoto = photo !== null;
  useEffect(() => {
    if (viewingPhoto) back.current?.focus();
    else photoTrigger.current?.focus();
  }, [viewingPhoto]);
  return <Modal onClose={viewingPhoto ? () => setPhoto(null) : onClose} title={viewingPhoto ? `${section.title} — просмотр фото` : section.title}>
    <div className="modal-content gallery-content" onKeyDown={e => {
      if (photo === null) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setPhoto((photo + 1) % n); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPhoto((photo - 1 + n) % n); }
    }}>
      <div className="gallery-head"><div><div className="eyebrow">Работы мастерской</div><h2>{section.title}</h2></div><span className="portfolio-count">{n} фото</span></div>
      <div hidden={viewingPhoto}>
        <p className="gallery-help">Выберите фотографию, чтобы рассмотреть детали.</p>
        <div className="gallery-grid">{section.photos.map((src, i) => <button className="gallery-photo" key={src} type="button" aria-label={`Открыть фото ${i + 1}: ${section.title}`} onClick={e => { photoTrigger.current = e.currentTarget; setPhoto(i); }}><Pic src={src} alt={`${section.title} — фото ${i + 1}`} /></button>)}</div>
      </div>
      {photo !== null && <div className="photo-viewer">
        <button ref={back} className="text-link photo-back" onClick={() => setPhoto(null)}>← Все фотографии</button>
        <Pic src={section.photos[photo]} alt={`${section.title} — фото ${photo + 1}`} light={false} loading="eager" />
        <div className="photo-controls"><button className="icon-button" aria-label="Предыдущее фото" onClick={() => setPhoto((photo - 1 + n) % n)}>←</button><span role="status">{photo + 1} / {n}</span><button className="icon-button" aria-label="Следующее фото" onClick={() => setPhoto((photo + 1) % n)}>→</button></div>
      </div>}
      <div className="gallery-contact"><p>Нравится это направление?<br /><span>Обсудите размеры, материалы и вашу идею с Ильёй.</span></p><a className="button button-primary" href={CONTACT.href}><Icon name="phone" size={18} />Позвонить мастеру</a></div>
    </div>
  </Modal>;
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [gallery, setGallery] = useState<GallerySection | null>(null);
  const [contact, setContact] = useState(false);
  const [service, setService] = useState('Кухня');
  const [privacy, setPrivacy] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal], .img-reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
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
  const openContact = (selectedService = 'Мебель на заказ') => { setService(selectedService); setContact(true); setMenu(false); };
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); document.querySelector<HTMLButtonElement>('.mobile-menu-button')?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);
  return <>
    <a className="skip-link" href="#main">Перейти к содержанию</a>
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`} id="home"><div className="header-inner"><Brand /><nav className="desktop-nav" aria-label="Основная навигация"><a href="#portfolio">Наши работы</a><a href="#master">О мастере</a><a href="#services">Что создаём</a><a href="#process">Как работаем</a></nav><button className="header-cta" onClick={() => openContact()}>Обсудить проект <Icon name="diagonal" size={17} /></button><button className="mobile-menu-button icon-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} aria-controls="mobile-navigation"><Icon name={menu ? 'close' : 'menu'} /></button></div>{menu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Мобильная навигация">{[['#portfolio', 'Наши работы'], ['#master', 'О мастере'], ['#services', 'Что создаём'], ['#process', 'Как работаем'], ['#contact', 'Контакты']].map(([href, text]) => <a key={href} href={href} onClick={() => setMenu(false)}>{text}<Icon name="diagonal" size={18} /></a>)}</nav>}</header>
    <main id="main" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="location"><span className="status-dot" />Частная мастерская · Хабаровск</div><h1 id="hero-title">Авторские кухни<br className="desktop-break" /> и мебель на заказ<br className="desktop-break" /> <span>в Хабаровске</span></h1><p className="hero-subtitle">Кухни, шкафы и мебель для вашего дома.<br />Индивидуальный проект — от замера до установки.</p><button className="button button-primary" onClick={() => openContact()}>Обсудить проект<Icon name="diagonal" size={19} /></button><a className="hero-phone" href={CONTACT.href}>{CONTACT.label}</a><p className="hero-note">Напрямую с Ильёй · Хабаровск и пригород</p><div className="hero-bottom"><span className="mini-mark"><Icon name="hand" size={24} /></span><p>Не конвейер. Не типовые решения.<br /><strong>Мебель с вашим характером.</strong></p></div></div>
        <div className="hero-media"><div className="hero-slide is-on"><Pic src={HERO_IMAGES[heroSlide]} alt={`Мебель мастерской «Илья кухни» — вид ${heroSlide + 1}`} light={false} loading="eager" fetchPriority={heroSlide === 0 ? 'high' : 'auto'} /></div><div className="image-top-note"><span />Продумано до последней детали</div><div className="hero-controls"><button className="icon-button" aria-label="Предыдущий интерьер" onClick={() => setHeroSlide(s => (s - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}>←</button><span aria-live="polite">{String(heroSlide + 1).padStart(2, '0')} / {String(HERO_IMAGES.length).padStart(2, '0')}</span><button className="icon-button" aria-label="Следующий интерьер" onClick={() => setHeroSlide(s => (s + 1) % HERO_IMAGES.length)}>→</button></div></div>
        
      </section>
      <div className="principles container"><div data-reveal style={delay(0)}><Icon name="ruler" size={26} /><span>По вашим размерам.<br /><strong>Под ваш образ жизни.</strong></span></div><div data-reveal style={delay(90)}><Icon name="leaf" size={26} /><span>Материалы, к которым<br /><strong>приятно прикоснуться.</strong></span></div><div data-reveal style={delay(180)}><Icon name="hand" size={26} /><span>Один мастер.<br /><strong>Личная ответственность.</strong></span></div></div>
      <nav className="category-nav container" aria-label="Направления мебели">{sections.map(section => <button key={section.slug} onClick={() => setGallery(section)}>{section.title}<Icon name="diagonal" size={14} /></button>)}</nav>
      <section id="portfolio" className="portfolio section container" data-reveal>
        <div className="section-heading"><div><div className="eyebrow">Каждая деталь имеет значение</div><h2 data-reveal>Мебель, в которой<br />виден <span className="mark">ваш характер.</span></h2></div><p data-reveal>Семь направлений и настоящие работы мастерской.<br className="desktop-break" /> Один подход — создавать как для себя.</p></div>
        <div className="cat-grid">{sections.map((section, i) => <CatCard key={section.slug} section={section} delayMs={(i % 4) * 90} onOpen={() => setGallery(section)} />)}</div>
      </section>
      <section id="master" className="master-section" data-reveal><div className="container master-grid"><div className="master-photo"><Pic className="img-reveal" src="/gallery/kuhni/p5.jpg" alt="Мебель на заказ в Хабаровске — работа мастерской «Илья кухни»" /><span className="photo-label">За каждой деталью — человек</span></div><div className="master-copy"><div className="eyebrow">Давайте познакомимся</div><h2 data-reveal>Меня зовут Илья.<br />И я отвечаю<br />за свою работу.</h2><p className="master-intro">«Хорошая мебель не просит внимания.<br />Она просто делает вашу жизнь удобнее».</p><p>Я создаю кухни и мебель под конкретного человека. Сначала слушаю: как вы готовите, что любите, где храните любимые чашки. И только потом предлагаю решения.</p><p>Для меня важны не только фасады на фотографии, но и то, как открывается каждый ящик. Поэтому я лично веду проект — от первого разговора до последней регулировки.</p><div className="master-signoff"><span className="signature">Илья</span><span>Ваш мастер.<br />На каждом этапе.</span></div><a className="text-link" href="#process">Как будет устроена наша работа<Icon name="arrow" size={18} /></a></div></div></section>
      <section id="services" className="section container services" data-reveal><div className="section-heading"><div><div className="eyebrow">В едином стиле с вашим домом</div><h2 data-reveal>Больше, чем кухни.</h2></div><p>Мебель, которая вписывается в пространство.<br />И в вашу жизнь.</p></div><div className="service-grid">{services.map((item, i) => <button key={item.title} className="service-card" data-reveal style={delay((i % 3) * 90)} onClick={() => openContact(item.value)}><Pic className="img-reveal" src={item.image} alt={'Мебель на заказ: ' + item.title} /><div className="service-shade" /><div className="service-copy"><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="circle-arrow"><Icon name="diagonal" /></span></div></button>)}</div></section>
      <section id="process" className="process-section section" data-reveal><div className="container"><div className="section-heading"><div><div className="eyebrow">Понятно. Спокойно. По шагам.</div><h2 data-reveal><span className="lead-strong">От первого «здравствуйте»<br />до вашей новой кухни.</span></h2></div><p>Без сложных схем и лишних посредников.<br />На каждом этапе вы общаетесь со мной.</p></div><div className="process-grid">{[{ title: 'Знакомимся', label: 'Заявка', text: 'Обсуждаем вашу идею, привычки и пожелания. Определяем ориентиры по бюджету.' }, { title: 'Продумываем', label: 'Замер', text: 'Изучаем пространство. Вместе выбираем материалы, планировку и каждую деталь.' }, { title: 'Создаём', label: 'Производство', text: 'Изготавливаем мебель по согласованному проекту. Держим вас в курсе процесса.' }, { title: 'Устанавливаем', label: 'Монтаж', text: 'Бережно привозим, собираем и регулируем. Проверяем, чтобы всё работало как надо.' }, { title: 'Остаёмся рядом', label: 'Гарантия', text: 'Не прощаемся после установки. Условия гарантии фиксируем в договоре.' }].map((item, index) => <div className="step" key={item.label} data-reveal style={delay((index % 5) * 90)}><div className="step-top"><span>0{index + 1}</span><small>{item.label}</small></div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>
      <section className="faq-section container" data-reveal><div><div className="eyebrow">Чтобы стало чуть понятнее</div><h2 data-reveal>До первого<br />разговора.</h2></div><div className="faq-list">{[{ q: 'Сколько стоит кухня на заказ?', a: 'Стоимость зависит от размеров, материалов фасадов, столешницы и фурнитуры. Начнём с вашей задачи и комфортного бюджета — после замера и выбора комплектации подготовим индивидуальный расчёт.' }, { q: 'Можно прийти со своим дизайн-проектом?', a: 'Конечно. Можно прислать готовый проект, план квартиры или просто фотографии, которые вам нравятся. Обсудим, как воплотить идею и сделать мебель удобной именно для вас.' }, { q: 'Какие сроки изготовления?', a: 'Срок зависит от объёма проекта и доступности материалов. Точную дату согласуем до начала работ и зафиксируем в договоре. Если у вас есть важная дата, расскажите о ней при первом разговоре.' }, { q: 'Работаете только в Хабаровске?', a: 'Основное направление — Хабаровск и пригород. Если ваш объект находится дальше, расскажите о нём по телефону: возможность замера, доставки и монтажа обсудим индивидуально.' }].map(item => <details key={item.q}><summary>{item.q}<Icon name="plus" size={20} /></summary><p>{item.a}</p></details>)}</div></section>
      <section id="contact" className="contact-section" data-reveal><div className="container"><div className="contact-heading"><div className="eyebrow"><span className="status-dot" />Хорошая мебель начинается с разговора</div><h2 data-reveal>Готовы обсудить<br />вашу мебель?</h2><p>Расскажите, какой вы её представляете.<br />Я помогу с остальным.</p></div><div className="contact-panel"><div><span className="contact-label">Илья · мастерская мебели</span><a className="contact-phone" href={CONTACT.href}>{CONTACT.label}</a><p>Позвоните, чтобы обсудить задачу,<br />замер и будущий проект.</p></div><a className="button button-primary" href={CONTACT.href}><Icon name="phone" />Позвонить Илье</a></div><div className="contact-bottom"><span><Icon name="pin" size={15} />Хабаровск и пригород</span><span>Общение напрямую с мастером. Без менеджеров.</span></div></div></section>
    </main>
    <footer className="footer container"><div className="footer-top"><Brand /><div className="footer-links"><a href="#portfolio">Наши работы</a><a href="#master">О мастере</a><a href="#contact">Контакты</a></div><a href="#home" className="back-top">Наверх <Icon name="arrow" size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Илья кухни. Сделано с вниманием.</span><button onClick={() => setPrivacy(true)}>Конфиденциальность</button><span>Авторская мебель. Личный подход.</span></div><p style={{ marginTop: '14px', fontSize: '10px', color: '#969a8f' }}>Разработка сайта — <a href="https://t.me/Dmitrii_khv27" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Дмитрий · @Dmitrii_khv27</a></p></footer>
    {gallery && <SectionModal section={gallery} onClose={() => setGallery(null)} />}
    <div className="site-grain" />
    {contact && <Modal onClose={() => setContact(false)} title="Обсудить проект с Ильёй"><div className="modal-content contact-modal"><div className="eyebrow">Начнём с вашей идеи</div><h2>{service}</h2><p>Расскажите Илье, какую мебель хотите создать. Вместе обсудите планировку, материалы и следующие шаги.</p><ul className="call-checklist"><li>Где будет стоять мебель и какие у неё размеры</li><li>Что важно: хранение, стиль, материалы</li><li>Желаемые сроки и ориентир по бюджету</li></ul><a className="contact-phone" href={CONTACT.href}>{CONTACT.label}</a><a className="button button-primary" href={CONTACT.href}><Icon name="phone" />Позвонить Илье</a><p className="fine-print">Не знаете точных размеров? Начните с разговора — детали можно уточнить на замере.</p></div></Modal>}
    {privacy && <Modal onClose={() => setPrivacy(false)} title="О данных на сайте"><div className="modal-content"><div className="eyebrow">О данных на сайте</div><h2>Конфиденциальность</h2><p>На сайте нет форм сбора заявок, регистрации и онлайн-оплаты. Для обсуждения проекта можно позвонить Илье по указанному номеру. Кнопка звонка открывает приложение для звонков на вашем устройстве.</p><p>Сайт не использует инструменты рекламной аналитики и не записывает введённые вами персональные данные. Фотографии загружаются с этого же сайта; шрифты — с Google Fonts. При загрузке страницы хостинг и поставщик шрифтов получают технические данные запроса, включая IP-адрес.</p><p>Ссылка на Telegram внизу страницы относится только к разработчику сайта.</p></div></Modal>}
    <a className="mobile-call" href={CONTACT.href}><Icon name="phone" size={19} /><span>Позвонить Илье<small>{CONTACT.label}</small></span><Icon name="diagonal" size={18} /></a>
  </>;
}
