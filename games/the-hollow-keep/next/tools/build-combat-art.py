#!/usr/bin/env python3
"""TASK_09 Route A: isolate generated source poses/effects, sample native pixels.
Writes combat sheets and linked Noah attack frames/manifest; other assets preserved.
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
 file=f'{hero}-{name}.png'
 # Preserve unchanged PNG bytes across Pillow versions/compression libraries.
 existing=Image.open(OUT/file).convert('RGBA') if (OUT/file).exists() else None
 if existing is None or existing.size!=image.size or existing.tobytes()!=image.tobytes():image.save(OUT/file,optimize=True)
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
eth=sorted([p for p in parts if p[0][1]>750],key=lambda p:p[0][0]);assert len(eth)==4
poses('ethan','charge',eth,[136]*4,[208,548,919,1294],[(302,834),(646,845),(1009,845),(1369,839)],[8]*4)

# TASK_09 4/5: new Route A source, constant body scale, low casting wrist.
# Alpha >220 isolates opaque figures from the generated translucent fringe.
parts=objects('ethan-mid-muzzle-source.png',10000)
parts.sort(key=lambda p:(p[0][1]>350,p[0][0]));assert len(parts)==8
roots=[(267,335),(765,335),(1317,335),(1869,335),
       (266,697),(771,697),(1340,697),(1868,697)]
wrists=[(320,176),(872,152),(1439,159),(1920,176),
        (374,508),(882,508),(1451,508),(1980,513)]
castFrames=[];castHands=[]
for (box,im),foot,hand in zip(parts,roots,wrists):
 scale=.44;im=clean(im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.BOX))
 dx=160-round((foot[0]-box[0])*scale);dy=215-round((foot[1]-box[1])*scale)
 frame=Image.new('RGBA',(352,256));frame.paste(im,(dx,dy))
 castFrames.append(frame);castHands.append({'x':round(dx+(hand[0]-box[0])*scale),'y':round(dy+(hand[1]-box[1])*scale)})
sheet('ethan','attack',castFrames[:4],(352,256),(160,215),[2,3,2,2],False,castHands[:4])
sheet('ethan','charge',castFrames[4:],(352,256),(160,215),[8]*4,True,castHands[4:])

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
# Choreography source: constant0.46 sampling factor for all fifteen bodies.
# Feet, rather than sword bounds, determine root; crouching never enlarges a body.
parts=objects('combo-choreography-source.png',10000)
parts.sort(key=lambda p:(0 if p[0][1]<320 else 1 if p[0][1]<660 else 2,p[0][0]));assert len(parts)==15,len(parts)
feet=[(173,318),(490,318),(837,318),(1153,318),(1437,317),
      (163,650),(480,652),(808,652),(1154,652),(1479,651),
      (183,947),(482,947),(818,946),(1154,945),(1458,948)]
handpoints=[(173,163),(557,133),(925,141),(1177,238),(1485,257),
            (205,599),(526,459),(790,387),(1123,385),(1450,379),
            (156,699),(551,841),(846,871),(1181,860),(1448,790)]
frames=[];hands=[]
for (box,im),foot,hand in zip(parts,feet,handpoints):
 scale=.46;sample=clean(im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.BOX))
 dx=160-round((foot[0]-box[0])*scale);dy=215-round((foot[1]-box[1])*scale)
 frame=Image.new('RGBA',(352,256));frame.paste(sample,(dx,dy));frames.append(frame)
 hands.append({'x':round(dx+(hand[0]-box[0])*scale),'y':round(dy+(hand[1]-box[1])*scale)})
# Raised overhead wind-up: align hood/feet to the same body height as idle;
# sword bounds do not determine body scale.
box,im=objects('noah-overhead-ready-source.png',10000)[0]
scale=.16;foot=(610,1351);hand=(620,420)
sample=clean(im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.BOX))
dx=160-round((foot[0]-box[0])*scale);dy=215-round((foot[1]-box[1])*scale)
frame=Image.new('RGBA',(352,256));frame.paste(sample,(dx,dy));frames.append(frame)
hands.append({'x':round(dx+(hand[0]-box[0])*scale),'y':round(dy+(hand[1]-box[1])*scale)})
for name,indices,ticks in [('attack',[0,1,2,3,14,0],[2,2,7,2,3,2]),
 ('attack-2',[0,5,6,7,8,9,0],[2,2,2,7,3,3,3]),
 ('attack-3',[0,15,11,12,13,0],[2,4,2,18,6,2])]:
 sheet('noah',name,[frames[i]for i in indices],(352,256),(160,215),ticks,False,[hands[i]for i in indices])
# Single generated ribbon per phase, rooted at feet so its path does not jump
# when the hands rise/fall. The existing effect source supplies shape/material.
paths=[('fx-slash',1,[(72,18),(108,26),(128,30)],[(175,123),(198,121),(216,119)],False,[2,2,3]),
       ('fx-slash-2',0,[(60,76),(76,92),(90,100)],[(192,133),(208,81),(196,27)],False,[2,2,3]),
       ('fx-slash-3',0,[(95,92),(130,110),(145,120)],[(183,3),(203,63),(180,125)],True,[3,3,3])]
for name,row,dimensions,positions,flip,ticks in paths:
 frames=[]
 for i,((width,height),(x,y))in enumerate(zip(dimensions,positions)):
  ribbon=effect(row,i)
  if flip:ribbon=ribbon.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
  ribbon=clean(ribbon.resize((width,height),Image.Resampling.BOX),True)
  frame=Image.new('RGBA',(192,256));frame.paste(ribbon,(x-160,y));frames.append(frame)
 sheet('noah',name,frames,(192,256),(0,215),ticks,False)
 manifest['heroes']['noah']['animations'][name]['anchor']='feet'

(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built strike / step-in rising cut / overhead smash and Ethan effects; existing64-color palette preserved.')
