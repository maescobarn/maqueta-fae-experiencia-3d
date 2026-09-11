"""Generate lossless model transport and 1024px texture variants. Originals stay intact.
Run on macOS: python3 scripts/prepare-mobile-assets.py (uses Apple's sips).
"""
from pathlib import Path
import subprocess
import zlib

root = Path(__file__).resolve().parents[1] / 'public'
model = (root / 'models/fae-v4.glb').read_bytes()
compressed = zlib.compress(model, 9)
assert zlib.decompress(compressed) == model
(root / 'models/fae-v4.glb.zlib').write_bytes(compressed)
print(f'Model: {len(model):,} -> {len(compressed):,} bytes; identical after decompression')
for folder in ['people-v4', 'materials/usach-originals']:
    source = root / folder
    target = source / 'mobile'
    target.mkdir(exist_ok=True)
    for file in sorted(source.glob('*.jpg')):
        subprocess.run(['sips', '-Z', '1024', '-s', 'formatOptions', '82', str(file), '--out', str(target / file.name)], check=True, stdout=subprocess.DEVNULL)
    originals = sum(f.stat().st_size for f in source.glob('*.jpg'))
    variants = sum(f.stat().st_size for f in target.glob('*.jpg'))
    print(f'{folder}: {originals:,} -> {variants:,} texture bytes')
