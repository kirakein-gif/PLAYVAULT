#!/usr/bin/env python3
"""Package TASK_09 actual-input captures with exact RGBA checks; no resampling."""
from pathlib import Path
from PIL import Image,ImageDraw
import sys
ROOT=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]if len(sys.argv)>1 else'/tmp/hk09-review');out=ROOT/'assets/combat-review';out.mkdir(exist_ok=True)
def save(im,name):
 path=out/(name+'.webp');im.save(path,lossless=True,method=6);assert Image.open(path).convert('RGBA').tobytes()==im.tobytes()
for direction in ['right','left']:
 board=Image.new('RGBA',(720*4,400*3),(16,19,32,255));draw=ImageDraw.Draw(board)
 for step in range(1,4):
  for frame in range(4):
   im=Image.open(source/f'noah-{direction}-step-{step}-frame-{frame}.png').convert('RGBA');x=frame*720;y=(step-1)*400
   draw.text((x+8,y+10),f'NOAH {direction} - combo {step}, actual pose {frame}',fill='#f1e6c9');board.paste(im,(x,y+40))
   assert board.crop((x,y+40,x+720,y+400)).tobytes()==im.tobytes()
 save(board,f'noah-{direction}-combo')
for name in ['ethan-charge-2','ethan-charge-3','ethan-projectile-2','ethan-projectile-3','ethan-burst-0','ethan-burst-1','ethan-burst-2','mobile-charge-780x330']:
 save(Image.open(source/(name+'.png')).convert('RGBA'),name)
print('32 actual-input captures packaged into10 lossless WebP images; no resampling; RGBA identical:',sum(p.stat().st_size for p in out.glob('*.webp')),'bytes')
