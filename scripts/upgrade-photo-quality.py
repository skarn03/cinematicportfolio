"""Create high-quality responsive displays and 4K viewer copies from untouched source JPEGs."""
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent.parent
SOURCE=Path(r'E:\pohoto\new editor')
DEST=ROOT/'public/photos'
metadata_path=ROOT/'src/data/newPhotos.json'
photos=json.loads(metadata_path.read_text(encoding='utf-8'))

def prepare(photo):
    if photo['id'].startswith('new-screenshot-'):
        return photo
    with Image.open(SOURCE/photo['sourceName']) as opened:
        profile=opened.info.get('icc_profile',b'')
        image=ImageOps.exif_transpose(opened).convert('RGB')
        variants=[]
        for suffix,limit,quality in [('-medium',1200,93),('',2400,94),('-large',3840,96)]:
            target=DEST/f"{photo['id']}{suffix}.webp"
            prepared=image.copy()
            prepared.thumbnail((limit,limit),Image.Resampling.LANCZOS)
            prepared.save(target,'WEBP',quality=quality,method=4,icc_profile=profile)
            variants.append((f'/photos/{target.name}',prepared.width,prepared.height))
        photo.update(src=variants[1][0],fullSrc=variants[2][0],fullWidth=variants[2][1],fullHeight=variants[2][2],
                     srcSet=', '.join(f'{url} {width}w' for url,width,height in variants))
    if photo['id']=='new-p1112123-edited':
        photo.update(category='Streets',title='Lanterns at the shopfront',description='Hanging lanterns outside a shaded shopfront.')
    return photo

with ThreadPoolExecutor(max_workers=2) as executor:
    updated=list(executor.map(prepare,photos))
metadata_path.write_text(json.dumps(updated,indent=2),encoding='utf-8')
manifest_path=ROOT/'scripts/photo-selection.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
for item in manifest:
    if item['id']=='new-p1112123-edited':
        item.update(category='Streets',title='Lanterns at the shopfront',description='Hanging lanterns outside a shaded shopfront.')
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
public=[p for p in updated if not p['id'].startswith('new-screenshot-')]
print(f'Prepared {len(public)} photographs at quality 93/94/96, up to 3840 px; embedded source color profiles preserved.')
print(f'Largest viewer image: {max((DEST/Path(p["fullSrc"]).name).stat().st_size for p in public)/1024/1024:.1f} MB. Originals untouched.')
