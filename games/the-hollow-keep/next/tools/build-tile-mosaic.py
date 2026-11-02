#!/usr/bin/env python3
"""Route A mosaic source -> native60px, existing palette, deterministic seams."""
from pathlib import Path
import json
import numpy as np
from scipy.ndimage import label,find_objects
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/pixel'
manifest=json.loads((OUT/'manifest.json').read_text());colors=[tuple(bytes.fromhex(c[1:]))for c in json.loads((OUT/'palette.json').read_text())['colors']]
pal=Image.new('P',(1,1));flat=[v for rgb in colors for v in rgb];pal.putpalette(flat+flat[-3:]*(256-len(colors)))
def mapped(im):
 a=np.array(im.convert('RGBA'));rgb=np.array(im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'));result=np.dstack((rgb,np.where(a[:,:,3]>=128,255,0).astype(np.uint8)));result[result[:,:,3]==0,:3]=0;return Image.fromarray(result)
def nearest(rgb):return min(colors,key=lambda p:sum((p[i]-int(rgb[i]))**2 for i in range(3)))
source=np.array(Image.open(ROOT/'tools/art-source/tile-mosaic-source.png').convert('RGBA'));labs,n=label(source[:,:,3]>240,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());parts=[]
for i,box in enumerate(find_objects(labs),1):
 if sizes[i]>4000:
  y,x=box;a=source[y,x].copy();a[:,:,3]=np.where(labs[y,x]==i,255,0);parts.append((y.start,x.start,Image.fromarray(a)))
parts.sort(key=lambda item:(0 if item[0]<290 else 1 if item[0]<580 else 2,item[1]));assert len(parts)==18,len(parts)
names=['back-1','back-2','back-3','wall-fill-2','wall-bottom','wall-left','wall-right','window-top','window-mid','window-bottom','pillar-top','pillar-mid','pillar-base','banner-top','banner-mid','banner-bottom','candle','ladder']
original=Image.open(OUT/'tiles.png').convert('RGBA');atlas=Image.new('RGBA',(21*60,60));atlas.paste(original.crop((0,0,180,60)),(0,0))
for i,(name,(_,_,im))in enumerate(zip(names,parts)):
 if name=='ladder':
  # Three broad source rungs, full-height rails; keep the warm wood material.
  raw=im.resize((48,60),Image.Resampling.BOX);tile=Image.new('RGBA',(60,60));tile.paste(raw,(6,0));tile=mapped(tile);a=np.array(tile)
  for y in range(60):
   count=np.count_nonzero(a[y,:,3]);
   if count>=36:
    for x in range(60):
     if a[y,x,3]:
      value=float(np.mean(a[y,x,:3]));a[y,x,:3]=nearest((151,129,109)if value<70 else(215,166,114)if value<110 else(233,205,169)if value<155 else a[y,x,:3])
  # Preserve source rail/wood material, but normalize all three rung bands
  # to six native rows at starts7/27/47: every cyclic gap is exactly20px.
  rows=np.count_nonzero(a[:,:,3],axis=1);active=rows>=.8*rows.max()
  groups=[]
  for y,on in enumerate(active):
   if on:
    if y==0 or not active[y-1]:groups.append([])
    groups[-1].append(y)
  assert len(groups)==3,groups
  uniform=np.repeat(a[0:1],60,axis=0)
  for start,group in zip((7,27,47),groups):
   band=Image.fromarray(a[group[0]:group[-1]+1]).resize((60,6),Image.Resampling.NEAREST)
   uniform[start:start+6]=np.array(band)
  a=uniform;a[-1]=a[0];tile=Image.fromarray(a);cell=3
 else:
  im=im.resize((60,60),Image.Resampling.BOX);base=Image.new('RGBA',(60,60),(16,20,32,255));base.alpha_composite(im);a=np.array(base).astype(float)
  if name.startswith('back-'):a[:,:,:3]*=.58
  elif name.startswith('wall-'):
   light=a[:,:,:3].mean(axis=2);cool=np.array([nearest(rgb)for rgb in[(16,20,32),(29,37,53),(43,55,75),(69,83,106)]],dtype='uint8');a[:,:,:3]=cool[np.digitize(light,[55,95,150])]
  else:a[:,:,:3]*=.78
  a[:,:,3]=255;tile=mapped(Image.fromarray(a.clip(0,255).astype('uint8')));a=np.array(tile)
  if name.startswith('back-'):
   border=nearest((16,20,32))+(255,);a[0]=border;a[-1]=border;a[:,0]=border;a[:,-1]=border
  if name in ['window-mid','pillar-mid','banner-mid']:a[-1]=a[0]
  tile=Image.fromarray(a);cell=i+4
 atlas.paste(tile,(cell*60,0));manifest['tiles']['cells'][name]=[cell,0]
atlas.save(OUT/'tiles.png',optimize=True);(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built17 mosaic cells and a broad three-rung wood/brass ladder; same64-color palette.')
