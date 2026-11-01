#!/usr/bin/env python3
"""Full selected x2 assets. Route A figures; native-grid effects/environment.
Read-only trial inputs; no trial asset or comparison file is written.
Pillow + numpy + scipy. Deterministic from committed generated source PNGs.
"""
from pathlib import Path
import json,math
import numpy as np
from scipy.ndimage import label,find_objects,binary_dilation
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'tools'/'art-source';OUT=ROOT/'assets'/'pixel';REVIEW=ROOT/'assets'/'pixel-review'

def objects(file):
 a=np.array(Image.open(file).convert('RGBA'));labs,n=label(a[:,:,3]>160,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());boxes=find_objects(labs);result=[]
 for i in range(1,n+1):
  if sizes[i]<5000:continue
  y,x=boxes[i-1];box=(max(0,x.start-2),max(0,y.start-2),min(a.shape[1],x.stop+2),min(a.shape[0],y.stop+2))
  cut=a.copy();cut[:,:,3]=np.where(binary_dilation(labs==i,iterations=2),a[:,:,3],0)
  result.append((box,Image.fromarray(cut).crop(box)))
 return result

def row(items,lo,hi,count):
 found=sorted([(b,im)for b,im in items if lo<=b[1]<hi],key=lambda x:x[0][0]);assert len(found)==count,(lo,hi,len(found));return [im for b,im in found]

def sample(source,height,straight=False):
 source=source.crop(source.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox())
 source=source.resize((round(source.width*height/source.height),height),Image.Resampling.BOX)
 if straight:
  # Upright standing-jump torso correction on the source raster, not a new body.
  a=np.array(source);h,w=a.shape[:2];out=np.zeros((h,w+80,4),dtype=np.uint8)
  for y in range(h):
   shift=round(40-.24*max(0,h*.65-y));out[y,shift:shift+w]=a[y]
  source=Image.fromarray(out)
 return source

eth=objects(SRC/'ethan-full-source.png');noah=objects(SRC/'noah-full-source.png');target=objects(SRC/'target-pose-board.png')
e_stand=row(eth,0,100,2);n_stand=row(noah,235,300,3)
ref_stand=next(im for b,im in target if 630<b[0]<900 and b[1]<100)
sources={
 ('ethan','jump-standing'):[e_stand[0],ref_stand,e_stand[1]],
 ('ethan','jump-running'):row(eth,300,400,3),('ethan','land'):row(eth,580,800,2),('ethan','attack'):row(eth,800,900,4),
 ('noah','run'):row(noah,0,100,6),('noah','jump-standing'):n_stand,('noah','jump-running'):row(noah,440,500,3),('noah','land'):row(noah,630,750,2),('noah','attack'):row(noah,750,900,4)}
heights={('ethan','jump-standing'):[118,116,132],('ethan','jump-running'):[108,108,126],('ethan','land'):[80,108],('ethan','attack'):[136,128,126,136],('noah','run'):[124]*6,('noah','jump-standing'):[116,112,128],('noah','jump-running'):[104,104,124],('noah','land'):[76,104],('noah','attack'):[146,128,112,128]}
frames={key:[sample(im,height,key[1]=='jump-standing')for im,height in zip(ims,heights[key])]for key,ims in sources.items()}
# Keep selected trial idle/run silhouettes as the starting point, then clean/re-palette.
trial=json.loads((ROOT/'assets/pixel-trial/x2/manifest.json').read_text())
for hero,action in [('ethan','idle'),('ethan','run'),('noah','idle')]:
 anim=trial['heroes'][hero]['animations'][action];sheet=Image.open(ROOT/'assets/pixel-trial/x2'/anim['file']).convert('RGBA')
 frames[(hero,action)]=[sheet.crop((i*anim['frameW'],0,(i+1)*anim['frameW'],anim['frameH']))for i in range(anim['frames'])]
# 52 source-material colors plus 12 deliberate environment/effect/skin anchors.
samples=[]
for ims in frames.values():
 for im in ims:
  a=np.array(im);samples.extend(a[:,:,:3][a[:,:,3]>128].tolist())
strip=Image.fromarray(np.array(samples,dtype=np.uint8).reshape((1,-1,3)))
q=strip.quantize(colors=52,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);rgb=q.getpalette()[:156]
palette=['#%02x%02x%02x'%tuple(rgb[i:i+3])for i in range(0,156,3)]
palette=list(dict.fromkeys(palette+['#101420','#1d2535','#2b374b','#45536a','#194a5b','#287b8b','#6dd8dc','#d8fff1','#372446','#684978','#d6ae92','#251f29']))
pal=Image.new('P',(1,1));flat=[int(c[i:i+2],16)for c in palette for i in [1,3,5]];pal.putpalette(flat+flat[-3:]*(256-len(palette)))
COLORS=[tuple(bytes.fromhex(c[1:]))for c in palette]
def color(hex):
 rgb=tuple(bytes.fromhex(hex[1:]));return min(COLORS,key=lambda p:sum((p[i]-rgb[i])**2 for i in range(3)))+(255,)
def mapped(im):
 a=np.array(im);rgb=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB');result=np.dstack((np.array(rgb),np.where(a[:,:,3]>=128,255,0).astype(np.uint8)));result[result[:,:,3]==0,:3]=0;return Image.fromarray(result)
def clean(im):
 a=np.array(im);mask=a[:,:,3]>=128;labs,n=label(mask,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel());mask=np.isin(labs,[i for i in range(1,n+1)if sizes[i]>=3])
 a[:,:,3]=np.where(mask,255,0);im=mapped(Image.fromarray(a));a=np.array(im)
 # One native pixel, including an upper-left lit edge. No doubled output raster.
 rim=binary_dilation(mask)&~mask;a[rim]=color('#15151e');lit=rim&np.roll(mask,-1,axis=1)&~np.roll(mask,-1,axis=0);a[lit]=color('#38333a')
 for y in range(1,a.shape[0]-1):
  for x in range(1,a.shape[1]-1):
   if not mask[y,x] and mask[y-1,x] and mask[y+1,x] and mask[y,x-1] and mask[y,x+1]:a[y,x]=a[y,x-1]
 a[a[:,:,3]==0,:3]=0;return Image.fromarray(a)
def save(im,name):mapped(im).save(OUT/name,optimize=True)
manifest={'version':1,'scale':2,'tileSize':60,'palette':'palette.json','heroes':{},'tiles':{'file':'tiles.png','cells':{'floor-top':[0,0],'wall-fill':[1,0],'ledge':[2,0]}},'background':'bg-chapel.png'}
OUT.mkdir(parents=True,exist_ok=True);REVIEW.mkdir(parents=True,exist_ok=True)
for hero,w,h in [('ethan',42,68),('noah',39,64)]:
 anims={}
 for action in ['idle','run','jump-standing','jump-running','land','attack']:
  ims=frames[(hero,action)];fw,fh=320 if action=='attack'else 256,224 if action=='attack'else 192;px,py=128,190
  sheet=Image.new('RGBA',(fw*len(ims),fh));already=(hero,action)in [('ethan','idle'),('ethan','run'),('noah','idle')]
  for f,base in enumerate(ims):
   frame=Image.new('RGBA',(fw,fh))
   if already:frame.paste(mapped(base),(0,0))
   else:
    expanded=Image.new('RGBA',(base.width+4,base.height+4));expanded.paste(base,(2,2));im=clean(expanded)
    a=np.array(im);ys,xs=np.nonzero(a[:,:,3]);top,bottom=int(ys.min()),int(ys.max());head=float(np.mean(xs[ys<top+max(8,round(im.height*.12))]))
    offset=16 if action in ['run','jump-running']else 5
    dx=px-round(head-offset);dy=py-bottom
    # Air poses lift the boots above the physical foot pivot while tucked.
    if action in ['jump-standing','jump-running']:dy-=8 if f<2 else 0
    frame.paste(im,(dx,dy))
   sheet.paste(frame,(f*fw,0))
  file=f'{hero}-{action}.png';sheet.save(OUT/file,optimize=True)
  ticks=[12]*4 if action=='idle'else [6]*6 if action=='run'else [4,4]if action=='land'else ([2,2,2,3]if hero=='noah'else[2,2,3,5])if action=='attack'else [6]*3
  anims[action]={'file':file,'frameW':fw,'frameH':fh,'frames':len(ims),'pivot':{'x':px,'y':py},'ticks':ticks,'loop':action in ['idle','run']}
  if action=='attack':anims[action]['hands']=([{'x':px+24,'y':py-74},{'x':px+60,'y':py-100},{'x':px+32,'y':py-60},{'x':px+26,'y':py-70}] if hero=='noah' else [{'x':px+24,'y':py-74},{'x':px+58,'y':py-102},{'x':px+43,'y':py-72},{'x':px+26,'y':py-70}])
 manifest['heroes'][hero]={'body':{'w':w,'h':h},'animations':anims}
# Native 60px masonry, not enlarged trial tiles.
tiles=Image.new('RGBA',(180,60));d=ImageDraw.Draw(tiles)
for cell in range(3):
 ox=cell*60;h=32 if cell==2 else 60;d.rectangle((ox,0,ox+59,h-1),fill=color('#1d2535'))
 for y in [0,19,40]:
  if y>=h:continue
  d.line((ox,y,ox+59,y),fill=color('#101420'))
  if y+1<h:d.line((ox+1,y+1,ox+58,y+1),fill=color('#2b374b'))
  for x in ([13,47]if y==19 else[31]):d.line((ox+x,y,ox+x,min(h-1,y+18)),fill=color('#101420'))
 for x,y in [(3,7),(27,12),(42,9),(8,26),(49,31),(18,47),(36,55),(54,49)]:
  if y<h:
   d.line((ox+x,y,ox+x+3,y),fill=color('#2b374b'));
   if y+1<h:d.point((ox+x+1,y+1),fill=color('#45536a'))
 if cell in [0,2]:
  d.line((ox,0,ox+59,0),fill=color('#45536a'));d.line((ox,2,ox+59,2),fill=color('#2b374b'))
  for x in [7,18,36,51]:d.line((ox+x,1,ox+x+2,1),fill=color('#a6a69d'))
save(tiles,'tiles.png')
# Quiet 1920x1080 gothic architecture with 1px native mortar cracks/highlights.
bg=Image.new('RGBA',(1920,1080),color('#101420'));d=ImageDraw.Draw(bg)
for y in range(160,1080,60):
 d.line((0,y,1919,y),fill=color('#1d2535'))
 for x in range((y//60%2)*120,1920,240):
  d.line((x,y,x,y+59),fill=color('#1d2535'));d.line((x+80,y+23,x+90,y+22),fill=color('#1d2535'))
for x in [150,530,910,1290,1670]:
 for inset,c in [(0,'#2b374b'),(5,'#101420'),(12,'#1d2535')]:
  d.polygon([(x-78+inset,650),(x-78+inset,316),(x-54+inset,264),(x,206+inset),(x+54-inset,264),(x+78-inset,316),(x+78-inset,650)],fill=color(c))
 d.line((x,225,x,640),fill=color('#2b374b'),width=3)
 for y in [428,558]:d.line((x-59,y,x+59,y),fill=color('#2b374b'),width=3)
 for dx in [-32,32]:
  d.polygon([(x+dx-11,340),(x+dx,312),(x+dx+11,340),(x+dx,382)],fill=color('#2b374b'));d.line((x+dx,326,x+dx,361),fill=color('#45536a'))
for x in [0,370,750,1130,1510,1890]:
 d.rectangle((x,160,x+29,1079),fill=color('#101420'));d.rectangle((x+6,180,x+13,1079),fill=color('#2b374b'));d.line((x+6,183,x+6,1079),fill=color('#45536a'))
 d.rectangle((x-6,160,x+36,178),fill=color('#2b374b'));d.line((x-6,160,x+36,160),fill=color('#45536a'))
for x in [404,1164,1872]:
 d.rectangle((x,662,x+16,672),fill=color('#735a46'));d.rectangle((x+6,630,x+10,662),fill=color('#d6bea2'))
 d.polygon([(x+8,606),(x+2,624),(x+8,632),(x+12,624)],fill=color('#be9061'));d.line((x+8,615,x+8,627),fill=color('#f7e9d1'),width=2)
save(bg,'bg-chapel.png')
# Rune projectile loop: fine core/filaments, independent native details each phase.
fx=Image.new('RGBA',(96,48));d=ImageDraw.Draw(fx)
for f in range(2):
 ox=f*48
 d.line([(ox+3,24),(ox+14,15-f),(ox+35,19),(ox+45,24),(ox+33,28),(ox+14,33+f),(ox+3,24)],fill=color('#287b8b'))
 d.line([(ox+11,24),(ox+24,20),(ox+43,24),(ox+24,27),(ox+11,24)],fill=color('#6dd8dc'),width=2)
 d.line((ox+25,24,ox+44,24),fill=color('#d8fff1'),width=2);d.point((ox+7-f,19),fill=color('#a58d78'));d.point((ox+10,31+f),fill=color('#6dd8dc'))
save(fx,'ethan-fx-rune.png');manifest['heroes']['ethan']['animations']['fx-rune']={'file':'ethan-fx-rune.png','frameW':48,'frameH':48,'frames':2,'pivot':{'x':24,'y':24},'ticks':[4,4],'loop':True}
# Crescent arcs contain NO broad filled polygon. Local x is always >=0 from hand.
fx=Image.new('RGBA',(112*3,144));d=ImageDraw.Draw(fx)
for f,(lo,hi) in enumerate([(-1.22,-.25),(-1.1,.78),(.16,1.18)]):
 ox=112*f
 pts=[(ox+round(100*math.cos(t)),72+round(62*math.sin(t)))for t in np.linspace(lo,hi,160)]
 d.line(pts,fill=color('#6dd8dc'),width=2)
 d.line(pts[20:-12],fill=color('#d8fff1'),width=1)
 inner=[(ox+round(95*math.cos(t)),72+round(58*math.sin(t)))for t in np.linspace(lo+.12,hi-.08,120)]
 for i,p in enumerate(inner):
  if f<2 or i%3:d.point(p,fill=color('#287b8b'))
 # Tapered tail and sparse decay along the blade path.
 for i,t in enumerate(np.linspace(lo,hi,24)):
  if i%3==f%3:d.point((ox+round(105*math.cos(t)),72+round(67*math.sin(t))),fill=color('#6dd8dc'))
save(fx,'noah-fx-slash.png');manifest['heroes']['noah']['animations']['fx-slash']={'file':'noah-fx-slash.png','frameW':112,'frameH':144,'frames':3,'pivot':{'x':0,'y':72},'ticks':[2,2,2],'loop':False}
(OUT/'palette.json').write_text(json.dumps({'colors':palette},indent=2)+'\n');(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
# Full six-pose target | final comparisons. Reference crops are from the selected
# source board; they are review artifacts, never runtime pixels.
board=Image.open(SRC/'target-pose-board.png').convert('RGBA');xs=[0,280,650,900,1240,1535,1983];actions=['idle','run','jump-standing','jump-running','land','attack'];font=ImageFont.load_default(size=18)
for hero in ['ethan','noah']:
 review=Image.new('RGB',(860,340*6),(21,23,32));dr=ImageDraw.Draw(review)
 for rowi,action in enumerate(actions):
  anim=manifest['heroes'][hero]['animations'][action];index=1 if action in ['jump-standing','jump-running','attack']else 0
  im=Image.open(OUT/anim['file']).crop((index*anim['frameW'],0,(index+1)*anim['frameW'],anim['frameH']));im=im.crop(im.getbbox());height=im.height*2
  ref=board.crop((xs[rowi],0 if hero=='ethan'else 416,xs[rowi+1],416 if hero=='ethan'else 793));labels,n=label(np.array(ref)[:,:,3]>160,structure=np.ones((3,3)));counts=np.bincount(labels.ravel());counts[0]=0;keep=binary_dilation(labels==counts.argmax(),iterations=2);arr=np.array(ref);arr[~keep]=0;ref=Image.fromarray(arr);ref=ref.crop(ref.getbbox());height=min(height,round(390*ref.height/ref.width),round(390*im.height/im.width));ref=ref.resize((round(ref.width*height/ref.height),height),Image.Resampling.BOX)
  dr.text((12,rowi*340+10),hero+' / '+action+'  Target | x2',font=font,fill='#ded8c8')
  review.paste(ref,(215-ref.width//2,rowi*340+325-ref.height),ref);out=im.resize((round(im.width*height/im.height),height),Image.Resampling.NEAREST);review.paste(out,(645-out.width//2,rowi*340+325-out.height),out)
 review.save(REVIEW/f'{hero}-reference-poses.png')
# All frames at native size for silhouette/motion inspection.
contact=Image.new('RGBA',(1920,12*230),(18,22,33,255))
for rowi,(hero,action) in enumerate((h,a)for h in ['ethan','noah']for a in actions):
 sheet=Image.open(OUT/f'{hero}-{action}.png');contact.paste(sheet,(0,rowi*230),sheet)
contact.save('/tmp/hk-full-x2-contact.png')
print('Built full scale2 set:',len(palette),'colors, 12 hero sheets + 2 effects, native tiles/background.')
