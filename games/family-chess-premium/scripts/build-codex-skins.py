"""Extract generated source sculptures; fit transparent native256 assets.
No authored silhouette substitutes: connected alpha removes generated fringe.
Requires Pillow, numpy, scipy. Sources remain outside public/app payload.
"""
from pathlib import Path
from PIL import Image
from scipy.ndimage import label, find_objects
import numpy as np
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'scripts/art-source/codex-skins'
PUBLIC=ROOT/'public/skins'
def objects(name, count, cols, chroma=False):
    a=np.array(Image.open(SRC/name).convert('RGBA'))
    mask=a[:,:,3]>=200
    if chroma:
        rgb=a[:,:,:3].astype(float);r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
        mask&=~((g>r*1.15)&(g>b*1.15)&(g>100))
        # Remove residual chroma spill from antialiased matte-gray stone edges.
        spill=(g>r+8)&(g>b+8);a[:,:,1]=np.where(spill,(r+b)/2,g).astype('uint8')
    labs,n=label(mask,structure=np.ones((3,3)))
    sizes=np.bincount(labs.ravel());parts=[]
    for i,box in enumerate(find_objects(labs),1):
        if box is not None and sizes[i]>5000:
            y,x=box;cut=a[y,x].copy();cut[labs[y,x]!=i]=0
            parts.append((box,Image.fromarray(cut)))
    assert len(parts)==count,(name,len(parts))
    parts.sort(key=lambda p:p[0][0].start+p[0][0].stop)
    rows=[parts[:cols],parts[cols:]]
    return [im for row in rows for _,im in sorted(row,key=lambda p:p[0][1].start)]
def write(im,p,limit,alpha=False):
    for quality in [92,88,84,80,76]:
        im.save(p,'WEBP',quality=quality,method=6,exact=alpha)
        if p.stat().st_size<=limit:return
    raise AssertionError((p,p.stat().st_size))
summary={}
for theme in ['medieval','gothic','noble']:
    dest=PUBLIC/(theme+'-codex');dest.mkdir(parents=True,exist_ok=True)
    family='wizard' if theme=='medieval' else theme
    parts=objects(family+'-pieces.png',12,6,chroma=theme=='noble')
    if theme=='medieval':
        anthro=objects('wizard-anthro.png',4,2)
        parts[2],parts[4],parts[8],parts[10]=anthro
    if theme=='medieval' and (SRC/'wizard-rearing-armed.png').exists():
        # Latest family request: mounted knight, raised forelegs, visible spear.
        # Keep the walking pose as an explicitly named comparison variant.
        standing=[parts[4],parts[10]]
        rearing=objects('wizard-rearing-armed.png',2,2)
        parts[4],parts[10]=rearing
        indexed=list(enumerate(parts))+[(12,standing[0]),(13,standing[1])]
    else:indexed=list(enumerate(parts))
    for i,im in indexed:
        code=(('w' if i==12 else 'b')+'N') if i>=12 else ('w' if i<6 else 'b')+'KQRBNP'[i%6]
        height={'K':224,'Q':220,'R':214,'B':218,'N':210,'P':164}[code[1]]
        scale=min(height/im.height,224/im.width)
        im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
        # Pivot at the centre of the plinth's bottom support, not horse/rider.
        alpha=np.array(im.getchannel('A'));ys,xs=np.where(alpha[-max(3,im.height//24):]>100)
        base=(int(xs.min())+int(xs.max()))/2
        x=max(12,min(244-im.width,round(128-base)));y=235-im.height
        frame=Image.new('RGBA',(256,256));frame.alpha_composite(im,(x,y))
        file=code+('-standing' if i>=12 else '')+'.webp'
        write(frame,dest/file,60000,True)
        a=Image.open(dest/file).convert('RGBA')
        box=a.getchannel('A').getbbox();assert a.size==(256,256) and box[3]<=236 and box[0]>=10 and box[2]<=246
    for tone in ['light','dark']:
        im=Image.open(SRC/(family+'-'+tone+'.png')).convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS)
        write(im,dest/('board-'+tone+'.webp'),200000)
    summary[theme+'-codex']={p.name:p.stat().st_size for p in sorted(dest.glob('*.webp'))}
total=sum(sum(s.values()) for s in summary.values());assert total<=3000000,total
print(json.dumps({'files':summary,'totalBytes':total},indent=2))
