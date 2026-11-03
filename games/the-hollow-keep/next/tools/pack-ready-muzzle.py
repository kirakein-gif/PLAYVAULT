"""Package actual screenshots without resampling, verify decoded RGBA/time."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, sys
source, out = map(Path, sys.argv[1:3]); out.mkdir(parents=True, exist_ok=True)
def save(im, name):
    p=out/(name+'.webp'); im.save(p,lossless=True,method=6)
    assert Image.open(p).convert('RGBA').tobytes()==im.convert('RGBA').tobytes()
def board(names,cols,name):
    rows=(len(names)+cols-1)//cols
    b=Image.new('RGBA',(720*cols,460*rows),(16,19,32,255));d=ImageDraw.Draw(b)
    for i,n in enumerate(names):
        im=Image.open(source/(n+'.png')).convert('RGBA'); x=i%cols*720;y=i//cols*460
        d.text((x+8,y+10),n,fill='#f1e6c9');b.paste(im,(x,y+40))
        assert b.crop((x,y+40,x+720,y+460)).tobytes()==im.tobytes()
    save(b,name)
board([f'noah-{d}-stop-{n}' for d in ['right','left'] for n in [1,2]],2,'noah-stop-ready')
board([f'ethan-{d}-{n}-cross' for d in ['right','left'] for n in ['fire-1','charge-2','charge-3']],3,'ethan-muzzle-cross')
for direction in ['right','left']:
    data=json.loads((source/f'noah-{direction}-trace.json').read_text(encoding='utf-8')); trace=data['trace']
    frames=[Image.open(source/f'noah-{direction}-tick-{t["i"]:03}.png').convert('RGBA') for t in trace]
    durations=[17 if i%3<2 else 16 for i in range(len(frames))]
    p=out/f'noah-{direction}-rhythm.webp'
    frames[0].save(p,save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True,method=6)
    dec=Image.open(p);elapsed=0;index=0;edge=durations[0]
    for i in range(dec.n_frames):
        dec.seek(i)
        while elapsed>=edge and index<len(frames)-1:index+=1;edge+=durations[index]
        assert dec.convert('RGBA').tobytes()==frames[index].tobytes()
        elapsed+=dec.info['duration']
    assert elapsed==sum(durations)
    # All painted body frames beside idle, preserving screenshot pixels.
    b=Image.new('RGBA',(720*8,460*3),(16,19,32,255));d=ImageDraw.Draw(b)
    idle=Image.open(source/f'noah-{direction}-idle.png').convert('RGBA')
    for step in [1,2,3]:
        file='noah-attack'+(f'-{step}' if step>1 else '')+'.png'
        phases=sorted({s['frame'] for t in trace for s in t['paint']['sprites'] if s['file']==file})
        y=(step-1)*460; b.paste(idle,(0,y+40));d.text((8,y+10),'IDLE / same scale',fill='#f1e6c9')
        for phase in phases:
            t=next(t for t in trace if any(s['file']==file and s['frame']==phase for s in t['paint']['sprites']))
            x=(phase+1)*720;b.paste(frames[t['i']],(x,y+40));d.text((x+8,y+10),f'step {step} frame {phase}',fill='#f1e6c9')
    save(b,f'noah-{direction}-idle-poses')
    # Actual startup, hit and returned stance, rather than old fixed timing.
    names=[]
    for attack in [e for e in data['events'] if e['type']=='attack']:
        step=attack['step']; hit=next(e for e in data['events'] if e['type']=='hit' and e.get('step')==step)
        for tick in [attack['tick']+2, max(hit['tick'],attack['tick']+2),attack['tick']+[17,21,33][step-1]]:
            t=next(t for t in trace if t['tick']==tick);names.append(f'noah-{direction}-tick-{t["i"]:03}')
    board(names,3,f'noah-{direction}-startup-hit-ready')
    (out/f'noah-{direction}-observations.json').write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf-8')
    print(direction,len(frames),'frames,',elapsed,'ms; lossless RGBA and timing verified')
for n in ['mobile-charge-780x330','ethan-projectile-2','ethan-projectile-3','ethan-burst-0','ethan-burst-1','ethan-burst-2']:
    save(Image.open(source/(n+'.png')).convert('RGBA'),n)
(out/'ready-muzzle-observations.json').write_bytes((source/'ready-muzzle-observations.json').read_bytes())
print('All boards preserve screenshot RGBA; no resampling.')
