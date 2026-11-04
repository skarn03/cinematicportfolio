"""Fail if any old or new source image is missing from the portfolio."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = Path(r'E:\pohoto\new editor')
extensions = {'.jpg', '.jpeg', '.png', '.webp'}
new_files = {p.name for p in source.rglob('*') if p.is_file() and p.suffix.lower() in extensions}
manifest = json.loads((root / 'scripts/photo-selection.json').read_text(encoding='utf-8'))
metadata = json.loads((root / 'src/data/newPhotos.json').read_text(encoding='utf-8'))
assert new_files == {p['filename'] for p in manifest}, 'New source files missing from manifest'
assert new_files == {p['sourceName'] for p in metadata}, 'New source files missing from catalog'
assert len({p['id'] for p in metadata}) == len(metadata), 'Duplicate new-image IDs'
for photo in metadata:
    for key in ['src', 'thumbnail']:
        assert (root / 'public' / photo[key].lstrip('/')).is_file(), f'Missing export: {photo[key]}'
old_files = {p.name for p in (root / 'src/data/Photos').iterdir() if p.suffix.lower() in extensions}
old_catalog = set(re.findall(r'photo\("([^"]+)"', (root / 'src/data/media.ts').read_text(encoding='utf-8')))
assert old_files == old_catalog, f'Old images missing: {old_files - old_catalog}'
print(f'PASS: {len(old_files)} original images + {len(new_files)} new-folder images = {len(old_files)+len(new_files)} catalog entries. No source files omitted.')
