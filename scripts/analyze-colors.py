"""Extract real image palettes for sequencing and atmosphere. Never modifies photographs."""
import colorsys
import json
import math
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def lab(rgb):
    values = [v / 255 for v in rgb]
    r, g, b = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
    xyz = [(r*.4124564+g*.3575761+b*.1804375)/.95047,
           r*.2126729+g*.7151522+b*.072175,
           (r*.0193339+g*.119192+b*.9503041)/1.08883]
    x, y, z = [v ** (1/3) if v > .008856 else 7.787*v+16/116 for v in xyz]
    return [round(116*y-16, 3), round(500*(x-y), 3), round(200*(y-z), 3)]

def analyze(path):
    with Image.open(path) as opened:
        image = opened.convert('RGB')
        w, h = image.size
        image = image.crop((int(w*.04), int(h*.04), int(w*.96), int(h*.96)))
        image.thumbnail((80, 80))
        pixels = list(image.getdata())
        mean = [sum(pixel[c] for pixel in pixels)/len(pixels) for c in range(3)]
        quantized = image.quantize(colors=6, method=Image.Quantize.MEDIANCUT)
        palette = quantized.getpalette()
        swatches = sorted(quantized.getcolors(), reverse=True)
        colors = [(count, palette[index*3:index*3+3]) for count, index in swatches]
        candidates = [(count, rgb) for count, rgb in colors if 18 < sum(rgb)/3 < 235]
        count, dominant = max(candidates or colors, key=lambda item:item[0])
        hue, saturation, value = colorsys.rgb_to_hsv(*(v/255 for v in dominant))
        return {'lab':lab(mean), 'rgb':dominant, 'palette':['#'+''.join(f'{channel:02x}' for channel in rgb) for _,rgb in colors[:4]],
                'hue':round(hue*360, 2), 'saturation':round(saturation, 3), 'lightness':round(lab(mean)[0], 2)}

def main():
    profiles = {}
    for path in (ROOT / 'src/data/Photos').iterdir():
        if path.suffix.lower() in {'.jpg', '.png', '.webp'}:
            profiles[path.stem] = analyze(path)
    new = json.loads((ROOT / 'src/data/newPhotos.json').read_text(encoding='utf-8'))
    for photo in new:
        profiles[photo['id']] = analyze(ROOT / 'public' / photo['thumbnail'].lstrip('/'))
    assert len(profiles) == 130
    destination = ROOT / 'src/data/colorProfiles.json'
    destination.write_text(json.dumps(profiles, separators=(',', ':')), encoding='utf-8')
    print(f'Analyzed {len(profiles)} actual image palettes. Wrote {destination.name}.')

if __name__ == '__main__':
    main()
