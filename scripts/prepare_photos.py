"""Inspect and prepare original photographs for the portfolio; originals stay untouched."""
import argparse
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

SOURCE = Path(r'E:\pohoto\new editor')
ROOT = Path(__file__).resolve().parent.parent

def include_every_file():
    manifest_path = ROOT / 'scripts/photo-selection.json'
    selections = json.loads(manifest_path.read_text(encoding='utf-8'))
    known = {entry['filename'] for entry in selections}
    # Contact-sheet inspection supplies subjects for the alternate edits too.
    subjects = {
        '211': ('A moment in green', 'People'), '21312': ('Through the doorway', 'Streets'),
        'asdadadasada': ('A sunlit passing', 'Streets'), 'P1012646': ('Lamplight portrait', 'People'),
        'P1112046': ('A doorway into the street', 'Streets'), 'P1112051': ('A doorway into the street', 'Streets'),
        'P1112135': ('The red backpack', 'Streets'), 'P1112136': ('Passing the shopfront', 'Streets'),
        'P1112200': ('Crossing paths', 'Streets'), 'P1112388': ('Utse in the afternoon', 'Streets'),
        'P1112623': ('The scooter shop', 'Streets'), 'P1122816': ('Faces in passing', 'Streets'),
        'P1122948': ('A sunlit passing', 'Streets'), 'P1122964': ('Outside Utse', 'Streets'),
        'P1123049': ('Along the shopfront', 'Streets'), 'P1123183': ('The white hat', 'Streets'),
        'P1123304': ('The street in motion', 'Streets'), 'P1123358': ('The narrow street', 'Streets'),
        'P1133908': ('The old street', 'Streets'), 'P1134393': ('A quieter lane', 'Streets'),
        'P1134397': ('An afternoon lane', 'Streets'), 'P1134467': ('A moment outside', 'Streets'),
        'P1134499': ('At the corner', 'Streets'), 'P1144982': ('A patch of sunlight', 'Streets'),
        'P1145002': ('A passing figure', 'Streets'), 'P1145014': ('Afternoon on the lane', 'Streets'),
        'P1145699': ('A portrait after sunset', 'People'), 'P1155887': ('The light in the doorway', 'After dark'),
        'P1156012': ('Into the evening', 'After dark'), 'P1156273': ('A softer passing', 'Streets'),
        'P1156517': ('Along the flowers', 'People'), 'P1167150': ('Under the canopy', 'Nature'),
        'P1178640': ('The city after hours', 'After dark'),
    }
    used_ids = {entry['id'] for entry in selections}
    for path in sorted(SOURCE.rglob('*')):
        if not path.is_file() or path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'} or path.name in known:
            continue
        stem = path.stem.split('-')[0].split(' ')[0]
        title, category = subjects.get(stem, ('From the studio', 'Studio'))
        if path.suffix.lower() == '.png':
            title, category = ('LITH studio design', 'Studio')
        slug = 'new-' + re.sub(r'[^a-z0-9]+', '-', path.stem.lower()).strip('-')
        while slug in used_ids:
            slug += '-variant'
        used_ids.add(slug)
        selections.append({'filename':path.name,'id':slug,'title':title,'category':category,
                           'description':f'{title}. An additional image from the new editor collection.'})
    manifest_path.write_text(json.dumps(selections, indent=2), encoding='utf-8')
    print(f'Manifest includes all {len(selections)} source images, including alternate edits and studio images.')

def export_photos():
    selections = json.loads((ROOT / 'scripts/photo-selection.json').read_text(encoding='utf-8'))
    output = ROOT / 'public/photos'
    output.mkdir(parents=True, exist_ok=True)
    metadata = []
    metadata_path = ROOT / 'src/data/newPhotos.json'
    existing = {entry['id']: entry for entry in json.loads(metadata_path.read_text(encoding='utf-8'))} if metadata_path.exists() else {}
    for selection in selections:
        source = SOURCE / selection['filename']
        with Image.open(source) as opened:
            original = ImageOps.exif_transpose(opened).convert('RGB')
            width, height = original.size
            for suffix, limit, quality in [('', 2400, 94), ('-small', 640, 85)]:
                destination = output / f"{selection['id']}{suffix}.webp"
                if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
                    continue
                prepared = original.copy()
                prepared.thumbnail((limit, limit), Image.Resampling.LANCZOS)
                prepared.save(destination, 'WEBP', quality=quality, method=5)
        metadata.append({key: value for key, value in selection.items() if key != 'filename'} | {
            'src': f"/photos/{selection['id']}.webp",
            'thumbnail': f"/photos/{selection['id']}-small.webp",
            'width': width, 'height': height,
            'sourceName': selection['filename'],
        })
        metadata[-1].update({key: existing[selection['id']][key] for key in ['fullSrc','fullWidth','fullHeight','srcSet'] if key in existing.get(selection['id'], {})})
    (ROOT / 'src/data/newPhotos.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    total = sum(path.stat().st_size for path in output.glob('*.webp'))
    print(f'Prepared {len(metadata)} original photographs; web assets total {total / 1024 / 1024:.1f} MB')

def original_thumbnails():
    output = ROOT / 'public/photos'
    output.mkdir(parents=True, exist_ok=True)
    for source in (ROOT / 'src/data/Photos').iterdir():
        if source.suffix.lower() not in {'.webp', '.jpg', '.png'}:
            continue
        destination = output / f'original-thumb-{source.stem}.webp'
        if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
            continue
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert('RGB')
            image.thumbnail((640, 640), Image.Resampling.LANCZOS)
            image.save(destination, 'WEBP', quality=81, method=5)
    print('Prepared thumbnails for every original portfolio image.')

def contact_sheets():
    files = sorted(p for p in SOURCE.rglob('*') if p.suffix.lower() in {'.jpg', '.jpeg', '.png'})
    output = Path.home() / 'AppData/Local/Temp/cinematic-photo-review'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'files.json').write_text(json.dumps([str(p) for p in files], indent=2), encoding='utf-8')
    for start in range(0, len(files), 36):
        page = Image.new('RGB', (1320, 6 * 185), '#171817')
        draw = ImageDraw.Draw(page)
        for offset, path in enumerate(files[start:start+36]):
            index = start + offset
            x, y = (offset % 6) * 220, (offset // 6) * 185
            with Image.open(path) as opened:
                image = ImageOps.exif_transpose(opened).convert('RGB')
                image.thumbnail((208, 150))
                page.paste(image, (x+(220-image.width)//2, y+(153-image.height)//2))
            draw.text((x+8, y+155), f'{index:02d} / {path.name[:25]}', fill='#e0dccb')
        dest = output / f'contact-{start//36+1}.jpg'
        page.save(dest, quality=88)
        print(dest)
    print(f'{len(files)} photographs indexed')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sheets', action='store_true')
    parser.add_argument('--export', action='store_true')
    parser.add_argument('--all', action='store_true')
    parser.add_argument('--original-thumbnails', action='store_true')
    args = parser.parse_args()
    if args.sheets:
        contact_sheets()
    if args.all:
        include_every_file()
    if args.export:
        export_photos()
    if args.original_thumbnails:
        original_thumbnails()
