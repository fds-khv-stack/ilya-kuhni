import { useEffect, useRef, useState } from 'react';
import './interior-films.css';

const films = [
  { file: 'interior-01', title: 'Комната обретает характер', description: 'Анимация превращения деревянных деталей в мебель для гостиной.' },
  { file: 'interior-02', title: 'У каждой вещи — своё место', description: 'Анимация сборки стеллажа и организации хранения.' },
];
const media = (file: string, extension: string) => `${import.meta.env.BASE_URL}videos/${file}.${extension}`;

export default function InteriorFilms() {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const film = films[index];

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) player.pause();
    });
    observer.observe(player);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', pauseWhenHidden); };
  }, [index]);

  const select = (next: number) => { setFailed(false); setIndex(next); };

  return <section className="interior-films container" aria-labelledby="films-title">
    <div className="film-copy">
      <div className="eyebrow">Интерьерное вдохновение</div>
      <h2 id="films-title">Из деталей —<br />в любимое <em>место.</em></h2>
      <p>Форма, цвет и движение. Две короткие истории о том, как мебель меняет пространство.</p>
      <div className="film-list" aria-label="Выбор видео">
        {films.map((item, i) => <button type="button" key={item.file} aria-pressed={index === i} onClick={() => select(i)}>
          <span className="film-number">0{i + 1}</span><span>{item.title}</span><span aria-hidden="true">↗</span>
        </button>)}
      </div>
      <p className="film-credit">Анимационные референсы · Pinterest<br />Для вдохновения; реальные работы — в каталоге ниже.</p>
    </div>
    <figure className="film-figure">
      <div className="film-screen">
        <video key={film.file} ref={video} src={media(film.file, 'mp4')} poster={media(film.file, 'webp')}
          controls playsInline muted preload="none" autoPlay={started} aria-label={film.description}
          onPlay={() => setStarted(true)} onError={() => setFailed(true)}
          onEnded={() => { if (index < films.length - 1) select(index + 1); }}>
          Ваш браузер не поддерживает видео.
        </video>
      </div>
      <figcaption><span aria-live="polite">0{index + 1} / 02 · {film.title}</span><a href={media(film.file, 'mp4')} target="_blank" rel="noopener noreferrer">Открыть видео ↗</a></figcaption>
      {failed && <p role="status" className="film-error">Видео не загрузилось. Попробуйте открыть его по ссылке выше.</p>}
    </figure>
  </section>;
}
