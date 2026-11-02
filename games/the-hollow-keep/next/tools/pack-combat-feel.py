#!/usr/bin/env python3
"""Lossless key-frame boards and exact-time actual-input WebP clips."""
from pathlib import Path
from PIL import Image, ImageDraw
import json,sys
ROOT=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]if len(sys.argv)>1 else'/tmp/hk09b-feel');out=ROOT/'assets/combat-review/followup';out.mkdir(parents=True,exist_ok=True)
for direction in ['right','left']:
 data=json.loads((source/f'noah-{direction}-trace.json').read_text());trace=data['trace'];frames=[Image.open(source/f'noah-{direction}-tick-{t["i"]:03}.png').convert('RGBA')for t in trace]
 board=Image.new('RGBA',(2160,1380),(16,19,32,255));draw=ImageDraw.Draw(board);start=trace[0]['tick']
 for attack in [e for e in data['events']if e['type']=='attack']:
  step=attack['step'];hold=5 if step==3 else 3
  for col,(name,tick)in enumerate([('contact / flash',attack['tick']+2),('held cut',attack['tick']+2+hold-1),('core stance',attack['tick']+4+hold+[9,12,22][step-1]//2)]):
   im=frames[tick-start];x=col*720;y=(step-1)*460;draw.text((x+8,y+10),f'NOAH {direction} step {step}: {name} - tick {tick-start}',fill='#f1e6c9');board.paste(im,(x,y+40));assert board.crop((x,y+40,x+720,y+460)).tobytes()==im.tobytes()
 name=out/f'noah-{direction}-impact-board.webp';board.save(name,lossless=True,method=6);assert Image.open(name).convert('RGBA').tobytes()==board.tobytes()
 durations=[17 if i%3<2 else 16 for i in range(len(frames))];clip=out/f'noah-{direction}-rhythm.webp'
 frames[0].save(clip,save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True,method=6)
 # WebP may coalesce identical frames; verify decoded images against source time.
 decoded=Image.open(clip);elapsed=0;index=0;edge=durations[0]
 for i in range(decoded.n_frames):
  decoded.seek(i);frame=decoded.convert('RGBA')
  while elapsed>=edge and index<len(frames)-1:index+=1;edge+=durations[index]
  assert frame.tobytes()==frames[index].tobytes(),(direction,i,index)
  elapsed+=decoded.info['duration']
 assert elapsed==sum(durations),(elapsed,sum(durations))
 observation={'events':data['events'],'frames':[{'i':t['i'],'tick':t['tick'],'pose':t['paint']['sprites'],'target':t['paint']['targets'],'physicalTarget':{'x':t['target']['x'],'y':t['target']['y'],'hp':t['target']['hp']},'text':t['paint']['text']}for t in trace]}
 (out/f'noah-{direction}-observations.json').write_text(json.dumps(observation,separators=(',',':'))+'\n')
 print(direction,len(frames),'actual tick frames /',elapsed,'ms; decodedRGBA/time equality verified')
print('followup images:',sum(p.stat().st_size for p in out.glob('*.webp')),'bytes')
