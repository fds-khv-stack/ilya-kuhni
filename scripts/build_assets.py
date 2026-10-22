"""Готовит фото для сайта: hero (photo-logo) + 8 разделов портфолио + src/data/gallery.ts.

Запуск из папки проекта Ilya-web:
  python scripts/build_assets.py --photos "G:/Мой диск/My_Project/Ilya_mebel/photos" --logo "G:/Мой диск/My_Project/Ilya_mebel/photo-logo"
"""
import argparse, glob, io, json, os
from PIL import Image

SECTIONS = [
    ("kuhni", "Кухни", "Кухни"),
    ("shkafy", "Шкафы", "Шкафы"),
    ("tumby", "Тумбы", "Тумбы"),
    ("vannaya", "Туалет и ванная комната", "Ванная и туалет"),
    ("spalni", "Спальни", "Спальни"),
    ("prihozhie", "Прихожие", "Прихожие"),
    ("stoly", "Столы", "Столы"),
    ("ofis", "Офисная_мебель", "Офисная мебель"),
]
HERO = [
        "Modern Dark Wood Kitchen Ideas for a Luxurious Home.jpg",
        "Без названия.jpg",
        "Без названия (5).jpg",
        "Без названия (1).jpg",
        "a clock made out of books on the wall next to a couch and coffee table.jpg",
        "Без названия (2).jpg",
        "Без названия (3).jpg",
        "Без названия (4).jpg",
        "Без названия (6).jpg"]
MAX = 1400
COVER_W = 900


def save(im, path, width, quality=80):
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return os.path.getsize(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photos", required=True)
    ap.add_argument("--logo", required=True)
    ap.add_argument("--out", default="public")
    a = ap.parse_args()
    total = 0

    for i, name in enumerate(HERO, 1):
        src = os.path.join(a.logo, name)
        im = Image.open(src)
        total += save(im, os.path.join(a.out, "images", f"hero-{i}.jpg"), 1100, 84)
        print("hero", i, name[:40])

    data = []
    for slug, folder, title in SECTIONS:
        files = sorted(glob.glob(os.path.join(a.photos, folder, "*.jpg")))
        if not files:
            print("пусто:", folder); continue
        land = [f for f in files if Image.open(f).width >= Image.open(f).height]
        cover = (land or files)[0]
        total += save(Image.open(cover), os.path.join(a.out, "gallery", slug, "cover.jpg"), COVER_W, 82)
        ph, used = [], set()
        order = land + [f for f in files if f not in land]
        step = max(1, len(order) // 40)
        for f in order[::step]:
            if f in used: continue
            used.add(f)
            n = len(ph) + 1
            total += save(Image.open(f), os.path.join(a.out, "gallery", slug, f"p{n}.jpg"), MAX, 80)
            ph.append(f"/gallery/{slug}/p{n}.jpg")
        data.append({"slug": slug, "title": title, "count": len(files),
                     "cover": f"/gallery/{slug}/cover.jpg", "photos": ph})
        print(f"{slug:9s} {title:24s} всего {len(files):3d} → в портфолио {len(ph):2d}")

    ts = ("// Сгенерировано scripts/build_assets.py — не править руками.\n"
          "export type GallerySection = { slug: string; title: string; count: number; cover: string; photos: string[] };\n"
          "export const sections: GallerySection[] = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    os.makedirs("src/data", exist_ok=True)
    with io.open("src/data/gallery.ts", "w", encoding="utf-8", newline="\n") as f:
        f.write(ts)
    print(f"\nитого файлов фото: {sum(1 + len(d['photos']) for d in data) + len(HERO)}, размер ≈ {total/1048576:.1f} МБ")
    print("данные → src/data/gallery.ts")


if __name__ == "__main__":
    main()
