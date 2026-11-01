#!/usr/bin/env python3
"""Route A prop atlas; retain existing hero art/palette. Pillow + numpy."""
from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import label,find_objects
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
atlas.save(OUT/'objects.png',optimize=True)
# New semantic props: isolate fully opaque source components, excluding glow.
source=np.array(Image.open(ROOT/'tools/art-source/entrance-barrier-source.png').convert('RGBA'))
labs,n=label(source[:,:,3]>240,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());parts=[]
for i,box in enumerate(find_objects(labs),1):
 if sizes[i]>3000:
  y,x=box;a=source[y,x].copy();a[:,:,3]=np.where(labs[y,x]==i,255,0);parts.append((y.start,x.start,Image.fromarray(a)))
parts=sorted(parts,key=lambda item:(0 if item[0]<320 else 1 if item[0]<600 else 2,item[1]));assert len(parts)==9
names=['barrier-v','barrier-h','mark-key','mark-lever','mark-light','mark-target','entrance','entrance-locked','breakable']
refine=Image.new('RGBA',(1080,180))
for i,(name,(_,_,im)) in enumerate(zip(names,parts)):
 w,h=(120,180)if name.startswith('entrance')else(60,60)
 if name.startswith('barrier'):
  im=mapped(im.resize((w,h),Image.Resampling.BOX));a=np.array(im)
  if name=='barrier-v':a[0]=a[30];a[-1]=a[30]
  else:a[:,0]=a[:,30];a[:,-1]=a[:,30]
  im=Image.fromarray(a)
 elif name=='breakable':
  detail=np.array(im.resize((60,60),Image.Resampling.BOX));a=np.array(Image.open(OUT/'tiles.png').crop((60,0,120,60)))
  # Transfer only the source's faint warm fissure into the existing masonry.
  mask=(detail[:,:,0]>detail[:,:,1]*1.08)&(detail[:,:,0]>detail[:,:,2]*1.12)&(detail[:,:,0]>80)
  a[mask]=colors[min(range(len(colors)),key=lambda j:sum((colors[j][k]-[43,55,75][k])**2 for k in range(3)))]+(255,);im=Image.fromarray(a)
  # Palette reduction loses the source's hairline: trace its short diagonal at 1px.
  ink=colors[min(range(len(colors)),key=lambda j:sum((colors[j][k]-[16,20,32][k])**2 for k in range(3)))]+(255,)
  ImageDraw.Draw(im).line([(40,16),(40,19),(38,23),(38,25),(35,28),(34,30)],fill=ink,width=1)
 else:
  ratio=min((w-2)/im.width,(h-2)/im.height);cut=mapped(im.resize((round(im.width*ratio),round(im.height*ratio)),Image.Resampling.BOX));im=Image.new('RGBA',(w,h));im.paste(cut,((w-cut.width)//2,h-cut.height))
 refine.paste(im,(i*120,0));manifest['objects'][name]={'file':'refine-objects.png','x':i*120,'y':0,'w':w,'h':h}
refine.save(OUT/'refine-objects.png',optimize=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built ladder, legacy controls, tiled barriers, method symbols, entrances and faint cracked masonry.')
