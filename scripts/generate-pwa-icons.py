from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public/assets/title.png').convert('RGB')
seal = source.crop((216, 344, 392, 456)).resize((336, 214), Image.Resampling.NEAREST)

def icon(size: int, path: Path, maskable: bool = False) -> None:
    scale = size / 512
    image = Image.new('RGB', (size, size), '#0c1430')
    draw = ImageDraw.Draw(image)
    frame = max(2, round(12 * scale if maskable else 18 * scale))
    inset = max(3, round(108 * scale if maskable else 36 * scale))
    if not maskable:
        draw.rectangle((inset, inset, size - inset - 1, size - inset - 1), outline='#ffcf55', width=frame)
        inner = inset + frame + max(2, round(12 * scale))
        draw.rectangle((inner, inner, size - inner - 1, size - inner - 1), outline='#2045aa', width=max(2, round(5 * scale)))
    target_width = round((280 if maskable else 336) * scale)
    target_height = round((179 if maskable else 214) * scale)
    crest = seal.resize((target_width, target_height), Image.Resampling.NEAREST)
    image.paste(crest, ((size - target_width) // 2, (size - target_height) // 2))
    image.save(path, format='PNG', optimize=True)

out = root / 'public/icons'
out.mkdir(parents=True, exist_ok=True)
icon(192, out / 'pwa-192.png')
icon(512, out / 'pwa-512.png')
icon(512, out / 'pwa-maskable-512.png', maskable=True)
