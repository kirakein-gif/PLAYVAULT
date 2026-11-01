#!/usr/bin/env python3
"""Lossless task07 review packaging; verify every decoded RGBA pixel."""
from pathlib import Path
import sys
from PIL import Image
root=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]if len(sys.argv)>1 else'/tmp/hk07-review');out=root/'assets/tile-mosaic-review';out.mkdir(parents=True,exist_ok=True)
names=['room-'+r for r in ['gate','crypt','vault','nave','reliquary','belfry','prism','loft']]
names+=['mobile-area-780x330','mobile-map-780x330','sealed-ladder-blocked','sealed-ladder-open','map-start','map-complete','upper-gallery','ladder-up','ladder-down']
for name in names:
 im=Image.open(source/(name+'.png')).convert('RGBA');target=out/(name+'.webp');im.save(target,lossless=True,method=6);assert im.tobytes()==Image.open(target).convert('RGBA').tobytes(),name
print(f'{len(names)} lossless WebP captures; exact RGBA equality; {sum(p.stat().st_size for p in out.glob("*.webp"))} bytes')
