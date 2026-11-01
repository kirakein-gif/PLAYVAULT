#!/usr/bin/env python3
"""Route A prop atlas; retain existing hero art/palette. Pillow + numpy."""
from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/pixel'
palette=json.loads((OUT/'palette.json').read_text())['colors'];colors=[tuple(bytes.fromhex(c[1:]))for c in palette]
pal=Image.new('P',(1,1));flat=[v for rgb in colors for v in rgb];pal.putpalette(flat+flat[-3:]*(256-len(colors)))
def mapped(im):
 a=np.array(im);rgb=np.array(im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'));result=np.dstack((rgb,np.where(a[:,:,3]>=128,255,0).astype(np.uint8)));result[result[:,:,3]==0,:3]=0;return Image.fromarray(result)
source=Image.open(ROOT/'tools/art-source/exploration-props-source.png').convert('RGBA')
names=['door-closed','door-open','lever-off','lever-on','light-off','light-on','key','breakable','locked-door','ladder']
atlas=Image.new('RGBA',(120*9,180));manifest=json.loads((OUT/'manifest.json').read_text());manifest['objects']={}
for i,name in enumerate(names):
 x=i%5;y=i//5;im=source.crop((round(x*source.width/5),round(y*source.height/2),round((x+1)*source.width/5),round((y+1)*source.height/2)))
 mask=im.getchannel('A').point(lambda a:255 if a>=128 else 0);im=im.crop(mask.getbbox())
 if name=='ladder':
  ladder=mapped(im.resize((44,60),Image.Resampling.BOX));tile=Image.new('RGBA',(60,60));tile.paste(ladder,(8,0))
  # Continuous rails; rung rhythm is independent of the source cell's ends.
  a=np.array(tile);d=ImageDraw.Draw(tile)
  for x in [9,10,49,50]:
   rgba=colors[min(range(len(colors)),key=lambda i:sum((colors[i][j]-[69,83,106][j])**2 for j in range(3)))]+(255,)
   d.line((x,0,x,59),fill=rgba)
  a=np.array(tile);a[0]=0;a[-1]=0
  for x in [9,10,49,50]:a[0,x]=rgba;a[-1,x]=rgba
  tile=Image.fromarray(a)
  # Repeat boundaries have identical opaque rails. Native 1px highlights retained.
  tiles=Image.new('RGBA',(240,60));tiles.paste(Image.open(OUT/'tiles.png').crop((0,0,180,60)),(0,0));tiles.paste(mapped(tile),(180,0));tiles.save(OUT/'tiles.png',optimize=True);manifest['tiles']['cells']['ladder']=[3,0]
  continue
 ratio=min(112/im.width,168/im.height);im=mapped(im.resize((round(im.width*ratio),round(im.height*ratio)),Image.Resampling.BOX));atlas.paste(im,(i*120+(120-im.width)//2,178-im.height));manifest['objects'][name]={'file':'objects.png','x':i*120,'y':0,'w':120,'h':180}
atlas.save(OUT/'objects.png',optimize=True);(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built ladder tile and 9 native props with unchanged 64-color palette.')
