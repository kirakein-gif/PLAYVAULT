#!/usr/bin/env python3
"""TASK_10 Route A: sample generated poses at native scale; retain existing art."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_fill_holes

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'tools/art-source'; OUT=ROOT/'assets/pixel'
m=json.loads((OUT/'manifest.json').read_text())
colors=json.loads((OUT/'palette.json').read_text())['colors']
pal=Image.new('P',(1,1)); flat=[int(c[i:i+2],16) for c in colors for i in (1,3,5)]
pal.putpalette(flat+flat[-3:]*(256-len(colors)))

def crop(source,box):
 a=np.array(source.crop(box).convert('RGBA'))
 labs,n=label(a[:,:,3]>220,structure=np.ones((3,3)))
 sizes=np.bincount(labs.ravel()); sizes[0]=0
 mask=labs==sizes.argmax()
 mask=binary_fill_holes(mask)
 a[:,:,3]=np.where(mask,255,0)
 im=Image.fromarray(a); return im.crop(im.getchannel('A').getbbox())

def native(im,size):
 im=im.resize(size,Image.Resampling.BOX)
 a=np.array(im); rgb=np.array(im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'))
 result=np.dstack((rgb,np.where(a[:,:,3]>145,255,0).astype(np.uint8)))
 result[result[:,:,3]==0,:3]=0
 return Image.fromarray(result)

def poses(name,cols,rows,count):
 im=Image.open(SRC/f'combat2-{name}-source.png')
 return [crop(im,(round(i%cols*im.width/cols),round(i//cols*im.height/rows),round((i%cols+1)*im.width/cols),round((i//cols+1)*im.height/rows))) for i in range(count)]

def sheet(owner,name,parts,sizes,frame,pivot,ticks,loop=False,hero=False):
 fw,fh=frame; dst=Image.new('RGBA',(fw*len(parts),fh))
 for i,(part,size) in enumerate(zip(parts,sizes)):
  im=native(part,size);dst.paste(im,(i*fw+pivot[0]-im.width//2,pivot[1]-im.height+1))
 file=f'{owner}-{name}.png';dst.save(OUT/file,optimize=True)
 group=m['heroes'] if hero else m['enemies']
 group[owner]['animations'][name]={'file':file,'frameW':fw,'frameH':fh,'frames':len(parts),'pivot':{'x':pivot[0],'y':pivot[1]},'ticks':ticks,'loop':loop}

m['enemies']={}
specs={
 'crawler':((32,36),5,2,10,[('walk',4,8),('charge',2,4),('hurt',1,8),('die',3,6)]),
 'wisp':((28,28),5,2,10,[('hover',4,8),('dive',2,5),('hurt',1,8),('die',3,6)]),
 'shield':((40,64),5,3,14,[('walk',4,10),('guard',1,6),('windup',2,10),('bash',2,5),('stagger',2,8),('die',3,7)])}
for kind,(body,cols,rows,count,anims) in specs.items():
 parts=poses(kind,cols,rows,count);m['enemies'][kind]={'body':{'w':body[0],'h':body[1]},'animations':{}}
 w,h=body[0]*2,body[1]*2; offset=0
 for action,n,t in anims:
  selected=parts[offset:offset+n];offset+=n
  sizes=[(w,h)]*n
  if action=='die': sizes=[(w+8,round(h*.8)),(w+16,round(h*.45)),(w+20,round(h*.25))]
  if action in ('charge','bash'):sizes=[(w+8,h-4),(w+12,h-8)]
  sheet(kind,action,selected,sizes,(w+48,h+20),((w+48)//2,h+12),[t]*n,action in ('walk','hover','charge','dive','stagger'))

hurt=poses('hurt',2,2,4)
for i,hero in enumerate(['ethan','noah']):
 # Match established hero body height; recoil coat/sword remain outside body box.
 height=m['heroes'][hero]['body']['h']*2
 parts=hurt[i*2:i*2+2]
 sizes=[(round(p.width*height/p.height),height) for p in parts]
 sheet(hero,'hurt',parts,sizes,(352,256),(160,215),[6,6],False,True)

im=Image.open(SRC/'combat2-rest-source.png')
shelter=crop(im,(0,0,im.width//2,im.height));heal=crop(im,(im.width//2,0,im.width,im.height))
sheetImage=Image.new('RGBA',(180,180));sheetImage.paste(native(shelter,(120,180)),(0,0));sheetImage.paste(native(heal,(32,32)),(128,0))
sheetImage.save(OUT/'combat2-objects.png',optimize=True)
m['objects']['shelter']={'file':'combat2-objects.png','x':0,'y':0,'w':120,'h':180}
m['objects']['heal']={'file':'combat2-objects.png','x':128,'y':0,'w':32,'h':32}
(OUT/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('TASK_10 native sheets and manifest written')
