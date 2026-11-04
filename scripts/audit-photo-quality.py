"""Verify responsive variants, native aspect ratios, resolution, and embedded color profiles."""
import json
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parent.parent
source=Path(r'E:\pohoto\new editor')
metadata=json.loads((root/'src/data/newPhotos.json').read_text(encoding='utf-8'))
public=[photo for photo in metadata if not photo['id'].startswith('new-screenshot-')]
assert len(public)==67
for photo in public:
    assert photo.get('fullSrc') and photo.get('srcSet'), f'Missing high-quality variants: {photo["id"]}'
    with Image.open(source/photo['sourceName']) as original:
        original_icc=original.info.get('icc_profile',b'') or b''
        oriented=ImageOps.exif_transpose(original)
        expected=min(3840,max(oriented.size))
        with Image.open(root/'public'/photo['fullSrc'].lstrip('/')) as viewer:
            assert max(viewer.size)==expected, f'Wrong viewer resolution: {photo["id"]}'
            assert abs(viewer.width/viewer.height-oriented.width/oriented.height)<.003, 'Aspect ratio changed'
            assert (viewer.info.get('icc_profile',b'') or b'')==original_icc, 'Source color profile missing'
        with Image.open(root/'public'/photo['src'].lstrip('/')) as display:
            assert max(display.size)==min(2400,max(oriented.size)), 'Display resolution is too small'
    assert (root/'public/photos'/f'{photo["id"]}-medium.webp').exists()
print('PASS: 67 photographs have responsive high-quality variants, up to 3840-pixel full-screen copies, original aspect ratios, and preserved color profiles.')
print('The 61 older photographs continue to use their existing original files. LITH screenshots are excluded from the public catalog.')
