"""Готовит WebP-версии для фото лендинга «Илья кухни».

Для каждой картинки в public/gallery и public/images создаёт:
  <имя>.webp      — в исходном размере (для лайтбокса/первого экрана)
  <имя>-sm.webp   — обрезанная по ширине 700 px (для плиток разделов и сетки каталога)

Идемпотентно: если webp новее исходного jpg — пропускает.
Запуск:
  uv run --with pillow python scripts/make_webp.py
"""
import io, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
SM_WIDTH = 700
Q_FULL = 78
Q_SM = 76
heroes = {'hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg'}


def targets():
    for base in ('gallery', 'images'):
        d = os.path.join(PUBLIC, base)
        for dp, _, files in os.walk(d):
            for f in sorted(files):
                if f.lower().endswith(('.jpg', '.jpeg')):
                    yield os.path.join(dp, f)


def convert(src, dst, width, quality):
    im = Image.open(src)
    im = im.convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=quality, method=6)
    return os.path.getsize(dst)


made_full = made_sm = skipped = 0
before = after_full = after_sm = 0
for src in targets():
    name = os.path.basename(src)
    is_hero = name in heroes
    full = src.rsplit('.', 1)[0] + '.webp'
    sm = src.rsplit('.', 1)[0] + '-sm.webp'
    size = os.path.getsize(src)
    before += size
    fresh = os.path.exists(full) and os.path.getmtime(full) > os.path.getmtime(src) \
        and (is_hero or (os.path.exists(sm) and os.path.getmtime(sm) > os.path.getmtime(src)))
    if fresh:
        skipped += 1
        after_full += os.path.getsize(full)
        after_sm += os.path.getsize(sm) if os.path.exists(sm) else 0
        continue
    after_full += convert(src, full, 4096 if is_hero else 1400, 82 if is_hero else Q_FULL)
    if not is_hero:  # первому экрану лёгкая версия не нужна — там всегда полный webp
        after_sm += convert(src, sm, SM_WIDTH, Q_SM)
    made_full += 1
    made_sm += 1

print(f'jpg: {before/1048576:.1f} МБ ({made_full + skipped} файлов)')
print(f'webp полный: {after_full/1048576:.1f} МБ | webp light(-{SM_WIDTH}): {after_sm/1048576:.1f} МБ')
print(f'создано: {made_full} пар, пропущено (актуальны): {skipped}')
print(f'экономия на плитках: {100 - 100*after_sm/before:.0f}% веса')
