#!/usr/bin/env python3
"""TASK_08 Route A. Build only climb sheets, preserving all existing assets."""
from pathlib import Path
import json
import numpy as np
from scipy.ndimage import label, binary_fill_holes
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/pixel'
source=Image.open(ROOT/'tools/art-source/climb-source.png').convert('RGBA')
colors=json.loads((OUT/'palette.json').read_text())['colors']
pal=Image.new('P',(1,1));flat=[int(c[i:i+2],16) for c in colors for i in (1,3,5)];pal.putpalette(flat+flat[-3:]*(256-len(colors)))
manifest=json.loads((OUT/'manifest.json').read_text())
for row,hero,height in [(0,'ethan',136),(1,'noah',128)]:
 frames=[]
 for phase,col in enumerate([0,1,0,1]):
  cell=source.crop((col*384,row*512,(col+1)*384,(row+1)*512))
  a=np.array(cell);mask=a[:,:,3]>220
  labels,n=label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0
  mask=binary_fill_holes(labels==sizes.argmax());a[:,:,3]=np.where(mask,255,0)
  cell=Image.fromarray(a);cell=cell.crop(cell.getchannel('A').getbbox())
  cell=cell.resize((round(cell.width*height/cell.height),height),Image.Resampling.BOX)
  # Source repeats the leading hand. Reverse rear-view silhouettes on the
  # opposite half-cycle so both hands and knees alternate, retaining materials.
  if phase>=2:cell=ImageOps.mirror(cell)
  a=np.array(cell);rgb=np.array(cell.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'))
  mask=a[:,:,3]>=150
  labels,n=label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;mask=labels==sizes.argmax()
  a=np.dstack((rgb,np.where(mask,255,0).astype(np.uint8)));a[~mask,:3]=0
  cell=Image.fromarray(a)
  # Native one-pixel glove/boot edge cleanup and restore small enclosed holes.
  a=np.array(cell);mask=a[:,:,3]>0
  holes=binary_fill_holes(mask)&~mask
  for y,x in zip(*np.where(holes)):
   if x and mask[y,x-1]:a[y,x]=a[y,x-1]
  cell=Image.fromarray(a)
  frame=Image.new('RGBA',(192,192));frame.alpha_composite(cell,((192-cell.width)//2,191-height+1));frames.append(frame)
 sheet=Image.new('RGBA',(768,192))
 for i,frame in enumerate(frames):sheet.alpha_composite(frame,(192*i,0))
 sheet.save(OUT/f'{hero}-climb.png')
 manifest['heroes'][hero]['animations']['climb']={'file':f'{hero}-climb.png','frameW':192,'frameH':192,'frames':4,'pivot':{'x':96,'y':191},'ticks':[8]*4,'loop':True}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
