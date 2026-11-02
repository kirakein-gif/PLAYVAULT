#!/usr/bin/env python3
"""TASK_09 Route A: isolate generated source poses/effects, sample native pixels.
Writes only new combat PNGs and manifest entries. Existing palette/assets preserved.
"""
from pathlib import Path
import json
import numpy as np
from scipy.ndimage import label, find_objects, binary_fill_holes
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'tools/art-source';OUT=ROOT/'assets/pixel'
colors=json.loads((OUT/'palette.json').read_text())['colors'];pal=Image.new('P',(1,1))
flat=[int(c[i:i+2],16) for c in colors for i in (1,3,5)];pal.putpalette(flat+flat[-3:]*(256-len(colors)))
manifest=json.loads((OUT/'manifest.json').read_text())
def largest(a,threshold=160,fill=False):
 mask=a[:,:,3]>threshold;labs,n=label(mask,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());sizes[0]=0
 mask=labs==sizes.argmax()
 if fill:mask=binary_fill_holes(mask)
 a=a.copy();a[:,:,3]=np.where(mask,255,0);a[~mask,:3]=0
 return Image.fromarray(a)
def objects(name,minimum):
 a=np.array(Image.open(SRC/name).convert('RGBA'));labs,n=label(a[:,:,3]>220,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());parts=[]
 for i,box in enumerate(find_objects(labs),1):
  if box and sizes[i]>minimum:
   y,x=box;cut=a[y,x].copy();cut[:,:,3]=np.where(binary_fill_holes(labs[y,x]==i),255,0);parts.append(((x.start,y.start,x.stop,y.stop),Image.fromarray(cut)))
 return parts

def clean(im,one=False):
 a=np.array(im);rgb=np.array(im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'))
 a=np.dstack((rgb,np.where(a[:,:,3]>145,255,0).astype(np.uint8)));a[a[:,:,3]==0,:3]=0
 # Remove detached sampling specks; preserve complete slash as one connected ribbon.
 if one:return largest(a,0)
 mask=a[:,:,3]>0;labs,n=label(mask,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());keep=sizes[labs]>=3;keep[labs==0]=False
 a[~keep]=0
 # Repair native enclosed single-pixel glove/cloth pinholes using their neighbor.
 holes=binary_fill_holes(keep)&~keep
 for y,x in zip(*np.where(holes)):
  if x and keep[y,x-1]:a[y,x]=a[y,x-1]
 return Image.fromarray(a)

def sheet(hero,name,frames,size,pivot,ticks,loop=False,hands=None):
 fw,fh=size;image=Image.new('RGBA',(fw*len(frames),fh))
 for i,im in enumerate(frames):image.paste(im,(i*fw,0))
 file=f'{hero}-{name}.png';image.save(OUT/file,optimize=True)
 anim={'file':file,'frameW':fw,'frameH':fh,'frames':len(frames),'pivot':{'x':pivot[0],'y':pivot[1]},'ticks':ticks,'loop':loop}
 if hands:anim['hands']=hands
 manifest['heroes'][hero]['animations'][name]=anim

def poses(hero,name,parts,heights,headXs,handPoints,ticks):
 faces={'attack-2':[(275,185),(585,152),(948,126),(1293,160)],
        'attack-3':[(485,146),(1175,166),(565,704),(1228,590)],
        'charge':[(218,796),(556,803),(930,803),(1305,799)]}
 def rgba(value):
  rgb=tuple(bytes.fromhex(value[1:]));return min([tuple(bytes.fromhex(c[1:]))for c in colors],key=lambda c:sum((c[i]-rgb[i])**2 for i in range(3)))+(255,)
 fw,fh,px,py=352,224,160,215;frames=[];hands=[]
 for index,((box,im),height,headX,hand) in enumerate(zip(parts,heights,headXs,handPoints)):
  scale=height/im.height;im=clean(im.resize((round(im.width*scale),height),Image.Resampling.BOX))
  dx=px-round((headX-box[0])*scale-4);dy=py-height+1
  frame=Image.new('RGBA',(fw,fh));frame.paste(im,(dx,dy))
  # Authored one-pixel eye/skin and glove highlights after quantization.
  face=faces[name][index]
  marks=[(face,'#251f29'),((face[0]+2/scale,face[1]+1/scale),'#d6ae92'),(hand,'#b89b70'if hero=='ethan'else'#8d96a4')]
  for (x,y),color in marks:
   x=round(dx+(x-box[0])*scale);y=round(dy+(y-box[1])*scale)
   if 0<=x<fw and 0<=y<fh and frame.getpixel((x,y))[3]:frame.putpixel((x,y),rgba(color))
  frames.append(frame)
  hands.append({'x':round(dx+(hand[0]-box[0])*scale),'y':round(dy+(hand[1]-box[1])*scale)})
 sheet(hero,name,frames,(fw,fh),(px,py),ticks,name=='charge',hands)

parts=objects('combat-poses-source.png',10000)
upper=sorted([p for p in parts if p[0][1]<200],key=lambda p:p[0][0]);assert len(upper)==4
poses('noah','attack-2',upper,[110,154,178,160],[270,575,925,1270],[(180,300),(642,143),(911,46),(1260,85)],[2,2,2,3])
fin=objects('combat-finisher-source.png',10000);fin.sort(key=lambda p:(p[0][1]>500,p[0][0]));assert len(fin)==4
poses('noah','attack-3',fin,[144,128,112,132],[465,1165,550,1215],[(380,64),(1290,237),(675,730),(1295,745)],[2,3,3,4])
eth=sorted([p for p in parts if p[0][1]>750],key=lambda p:p[0][0]);assert len(eth)==4
poses('ethan','charge',eth,[136]*4,[208,548,919,1294],[(302,834),(646,845),(1009,845),(1369,839)],[8]*4)

source=Image.open(SRC/'combat-effects-source.png').convert('RGBA');W,H=source.size
# Source rows have hand-spaced gutters, measured once on the generated board.
ybounds=[0,240,420,635,800,985,H]
def effect(row,col):
 im=source.crop((round(W*col/3),ybounds[row],round(W*(col+1)/3),ybounds[row+1]))
 a=np.array(im);mask=a[:,:,3]>220;a[:,:,3]=np.where(mask,255,0);im=Image.fromarray(a)
 if row<2:im=largest(a,220)
 return im.crop(im.getchannel('A').getbbox())
def fx(hero,name,row,dimensions,size,pivot,positions=None,once=False,one=False):
 frames=[]
 for i,(width,height) in enumerate(dimensions):
  im=effect(row,i%3);im=clean(im.resize((width,height),Image.Resampling.BOX),one)
  frame=Image.new('RGBA',size);x,y=positions[i] if positions else((size[0]-width)//2,(size[1]-height)//2)
  frame.paste(im,(x,y));frames.append(frame)
 sheet(hero,name,frames,size,pivot,[2,2,3] if name=='fx-slash-2' else[3]*len(frames),not once)
fx('noah','fx-slash-2',0,[(50,66),(86,104),(110,100)],(160,160),(6,120),[(6,54),(6,16),(6,20)],True,True)
fx('noah','fx-slash-3',1,[(96,24),(140,34),(172,32)],(192,96),(6,48),[(6,36),(6,31),(6,32)],True,True)
# Nine native frames: three level banks with three gathering pulses each.
frames=[]
for level in range(3):
 for phase in range(3):
  width=[24,40,60][level]+phase*2
  im=effect(2,level);im=clean(im.resize((width,width),Image.Resampling.BOX))
  frame=Image.new('RGBA',(96,96));frame.paste(im,((96-width)//2,(96-width)//2));frames.append(frame)
sheet('ethan','fx-charge',frames,(96,96),(48,48),[6]*9,True)
fx('ethan','fx-rune-2',3,[(52,30),(55,32),(53,31)],(64,48),(32,24))
fx('ethan','fx-rune-3',4,[(72,44),(77,46),(74,45)],(96,64),(48,32))
fx('ethan','fx-burst',5,[(40,40),(112,112),(176,176)],(192,192),(96,96),once=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built9 combat sheets from3 generated sources; existing64-color palette preserved.')
