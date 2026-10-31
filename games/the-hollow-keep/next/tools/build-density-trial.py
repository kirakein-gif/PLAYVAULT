#!/usr/bin/env python3
"""Route A: source cutouts -> independently sampled x1/x2 -> palette -> pixel cleanup.
Requires Pillow, numpy, scipy. Source PNGs and all processing are reproducible.
Neither candidate is a scaled copy of the other. No gameplay parameters change.
"""
from pathlib import Path
import json,hashlib
import numpy as np
from scipy.ndimage import label,find_objects,binary_dilation
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'tools'/'art-source';OUT=ROOT/'assets'/'pixel-trial'
DARK='#15151e';LIT='#38333a';SKIN='#d6ae92';EYE='#251f29'

def objects(file):
    a=np.array(Image.open(file).convert('RGBA'))
    labels,n=label(a[:,:,3]>160,structure=np.ones((3,3)))
    sizes=np.bincount(labels.ravel());boxes=find_objects(labels)
    found=[]
    for i in range(1,n+1):
        if sizes[i]<10000:continue
        mask=binary_dilation(labels==i,iterations=2)
        cut=a.copy();cut[:,:,3]=np.where(mask,a[:,:,3],0)
        box=boxes[i-1];y,x=box
        # Expand two pixels to retain the antialiased underdrawing before final cleanup.
        b=(max(0,x.start-2),max(0,y.start-2),min(a.shape[1],x.stop+2),min(a.shape[0],y.stop+2))
        found.append((b,Image.fromarray(cut).crop(b)))
    return sorted(found,key=lambda item:item[0][0])

board=objects(SRC/'target-pose-board.png')
ethan_idle=next(im for b,im in board if b[1]<100 and b[0]<100)
noah_idle=next(im for b,im in board if b[1]>400 and b[0]<100)
ethan_target_run=next(im for b,im in board if 250<b[0]<400 and b[1]<200)
runs=[im for b,im in objects(SRC/'ethan-run-source.png')]
assert len(runs)==6
# Frame 0 retains the exact user-selected running reference, followed by source phases.
runs[0]=ethan_target_run

def native(source,height):
    alpha=source.getchannel('A').point(lambda a:255 if a>128 else 0)
    box=alpha.getbbox();source=source.crop(box)
    w=round(source.width*height/source.height)
    return source.resize((w,height),Image.Resampling.BOX)

def idle_mesh(im,phase,scale):
    a=np.array(im);h,w=a.shape[:2];result=np.zeros_like(a)
    # Deliberate breathing and cloth sway, same game-space amplitude at both densities.
    breath=[0,-.6,0,.6][phase];wind=[0,.6,1,-.6][phase]
    for y in range(h):
        dy=round(breath*scale*max(0,1-y/(h*.82)))
        sy=max(0,min(h-1,y-dy))
        for x in range(w):
            dx=round(wind*scale*max(0,min(1,(y-h*.3)/(h*.55)))*max(0,1-x/(w*.65)))
            sx=x-dx
            if 0<=sx<w:result[y,x]=a[sy,sx]
    return Image.fromarray(result)

# Derive one shared palette from BOTH independently sampled candidates, avoiding
# a palette difference becoming a confounding variable in the density comparison.
bases={}
for scale in [1,2]:
    bases[(scale,'ethan','idle')]=[idle_mesh(native(ethan_idle,68*scale-2),f,scale)for f in range(4)]
    bases[(scale,'noah','idle')]=[idle_mesh(native(noah_idle,64*scale-2),f,scale)for f in range(4)]
    bases[(scale,'ethan','run')]=[native(im,64*scale-2) for im in runs]
samples=[]
for frames in bases.values():
    for im in frames:
        a=np.array(im);samples.extend(a[:,:,:3][a[:,:,3]>128].tolist())
strip=Image.fromarray(np.array(samples,dtype=np.uint8).reshape((1,-1,3)))
q=strip.quantize(colors=60,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
colors=q.getpalette()[:180];pal=['#%02x%02x%02x'%tuple(colors[i:i+3])for i in range(0,180,3)]
pal=list(dict.fromkeys(pal+[DARK,LIT,SKIN,EYE]))
palette_img=Image.new('P',(1,1));raw=[int(c[i:i+2],16)for c in pal for i in [1,3,5]]
palette_img.putpalette(raw+raw[-3:]*(256-len(pal)))


def cleanup(im,scale,hero,action):
    a=np.array(im);mask=a[:,:,3]>=128
    labs,n=label(mask,structure=np.ones((3,3)));sizes=np.bincount(labs.ravel())
    # Remove detached single pixels and tiny antialias fragments; keep the body,
    # connected blade, fingers and cloth. Native details inside the body remain.
    keep=[i for i in range(1,n+1)if sizes[i]>=max(2,scale*scale)]
    mask=np.isin(labs,keep)
    rgb=Image.fromarray(a[:,:,:3]).quantize(palette=palette_img,dither=Image.Dither.NONE).convert('RGB')
    clean=np.dstack((np.array(rgb),np.where(mask,255,0).astype('uint8')))
    # A source contour is reduced to a single native-pixel selective border.
    rim=binary_dilation(mask,structure=np.ones((3,3)))&~mask
    clean[rim,:3]=tuple(bytes.fromhex(DARK[1:]));clean[rim,3]=255
    lit=rim & ~np.roll(mask,-1,axis=0) & np.roll(mask,-1,axis=1)
    clean[lit,:3]=tuple(bytes.fromhex(LIT[1:]))
    # Face cleanup uses a 3/4 cheek silhouette, never a projecting nose polygon.
    # Preserve source skin shading; collapse a one-pixel isolated face-edge spur.
    for y in range(1,min(clean.shape[0]-1,round(14*scale))):
        for x in range(1,clean.shape[1]-1):
            if not mask[y,x]:continue
            r,g,b=clean[y,x,:3].astype(int)
            if r>100 and r>g*1.08 and g>b*1.05 and mask[y,x-1] and not mask[y,x+1] and not mask[y-1,x] and not mask[y+1,x]:
                clean[y,x]=clean[y,x-1]
    clean[clean[:,:,3]==0,:3]=0
    return Image.fromarray(clean)

references={('ethan','idle'):ethan_idle,('ethan','run'):ethan_target_run,('noah','idle'):noah_idle}
for scale in [1,2]:
    folder=OUT/f'x{scale}';folder.mkdir(parents=True,exist_ok=True)
    heroes={}
    for hero,w,h in [('ethan',42,68),('noah',39,64)]:
        anims={}
        for action in (['idle','run']if hero=='ethan'else['idle']):
            frames=bases[(scale,hero,action)];fw,fh=128*scale,96*scale;px,py=64*scale,95*scale
            sheet=Image.new('RGBA',(fw*len(frames),fh))
            for f,base in enumerate(frames):
                # Border cleanup needs one transparent source-pixel margin.
                expanded=Image.new('RGBA',(base.width+4,base.height+4));expanded.paste(base,(2,2))
                image=cleanup(expanded,scale,hero,action)
                a=np.array(image);ys,xs=np.nonzero(a[:,:,3]);top,bottom=ys.min(),ys.max()
                head_x=float(np.mean(xs[ys<top+max(3,round(9*scale))]))
                anchor=round(head_x-(8 if action=='run'else 1)*scale)
                dx,dy=px-anchor,py-bottom
                frame=Image.new('RGBA',(fw,fh));frame.paste(image,(dx,dy))
                # Native-pixel face touch-up: a dark eye/brow and a cheek/nose
                # highlight INSIDE the source silhouette, never a protruding beak.
                pixels=np.array(frame);fy,fx=np.nonzero(pixels[:,:,3]);head_top=int(fy.min())
                eye_x=px+(10 if action=='run'else 3)*scale+(scale-1)
                eye_y=head_top+(8 if hero=='noah'else 7)*scale+(scale-1 if hero=='noah'else 0)
                ink=tuple(bytes.fromhex(EYE[1:]))+(255,);skin=tuple(bytes.fromhex(SKIN[1:]))+(255,)
                for x,y,color in [(eye_x,eye_y,ink),(eye_x-1,eye_y-1,ink),(eye_x+1,eye_y+1,skin)]:
                    if pixels[y,x,3]:pixels[y,x]=color
                # Close isolated one-pixel holes in gloves/cloth; leave deliberate
                # spaces between limbs and large mantle cutouts intact.
                opaque=pixels[:,:,3]>0
                for y in range(head_top+14*scale,min(fh-1,py-10*scale)):
                    for x in range(1,fw-1):
                        if not opaque[y,x] and opaque[y-1,x] and opaque[y+1,x] and opaque[y,x-1] and opaque[y,x+1]:pixels[y,x]=pixels[y,x-1]
                frame=Image.fromarray(pixels)
                sheet.paste(frame,(f*fw,0))
            sheet.save(folder/f'{hero}-{action}.png',optimize=True)
            anims[action]={'file':f'{hero}-{action}.png','frameW':fw,'frameH':fh,'frames':len(frames),'pivot':{'x':px,'y':py},'ticks':[12 if action=='idle'else 6]*len(frames),'loop':True}
        heroes[hero]={'body':{'w':w,'h':h},'animations':anims}
    (folder/'manifest.json').write_text(json.dumps({'version':1,'scale':scale,'tileSize':30*scale,'palette':'palette.json','trial':True,'heroes':heroes},indent=2)+'\n')
    (folder/'palette.json').write_text(json.dumps({'colors':pal},indent=2)+'\n')

# Review composites share the SAME visible physical character height. x2 is
# independently sampled from the source, not nearest-neighbour enlarged x1.
font=ImageFont.load_default(size=16)
for hero,action in [('ethan','idle'),('ethan','run'),('noah','idle')]:
    height=272 if hero=='ethan'else 256
    if action=='run':height=256
    review=Image.new('RGB',(900,340),(21,23,32));d=ImageDraw.Draw(review)
    for i,label_text in enumerate(['Target pose reference','x1 / 68px (Noah64)','x2 / 136px (Noah128)']):d.text((300*i+12,12),label_text,font=font,fill='#ddd8ca')
    ref=references[(hero,action)];ref=ref.crop(ref.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox());ref=ref.resize((round(ref.width*height/ref.height),height),Image.Resampling.BOX)
    review.paste(ref,(150-ref.width//2,320-ref.height),ref)
    for i,scale in enumerate([1,2],1):
        im=Image.open(OUT/f'x{scale}'/f'{hero}-{action}.png');fw=128*scale;im=im.crop((0,0,fw,96*scale));im=im.crop(im.getbbox());im=im.resize((round(im.width*height/im.height),height),Image.Resampling.NEAREST)
        review.paste(im,(300*i+150-im.width//2,320-im.height),im)
    review.save(OUT/'comparison'/f'{hero}-{action}-density.png')
print('Built x1/x2 trial sheets from source PNGs, shared',len(pal),'color palette.')
