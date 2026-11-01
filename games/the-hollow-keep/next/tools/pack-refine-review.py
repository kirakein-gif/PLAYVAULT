#!/usr/bin/env python3
"""Lossless review packaging, with decoded-pixel equality checks. Pillow required."""
from pathlib import Path
import sys
from PIL import Image
root=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]if len(sys.argv)>1 else'/tmp/hk06-review');out=root/'assets/exploration-refine-review';out.mkdir(parents=True,exist_ok=True)
names=['room-'+r for r in ['gate','crypt','vault','nave','reliquary','belfry','prism','loft']]
names += [state+'-'+d for d in ['bronze-door','oath-door','bell-door','light-door','return-seal']for state in ['closed','open']]
names += ['before-enter-gate-arch','enter-gate-arch','before-enter-crypt-arch','enter-crypt-arch','map-start','map-complete','mobile-area-780x330','mobile-map-780x330','break-cracked-screen','pickup-sigil-key']
for name in names:
 im=Image.open(source/(name+'.png')).convert('RGBA');target=out/(name+'.webp');im.save(target,lossless=True,method=6)
 assert im.tobytes()==Image.open(target).convert('RGBA').tobytes(),name
print(f'{len(names)} lossless WebP captures; pixels identical to source PNGs; {sum(p.stat().st_size for p in out.glob("*.webp"))} bytes')
