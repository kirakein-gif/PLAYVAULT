#!/usr/bin/env python3
"""Native pixel redraw from the approved appearance / generated pose reference.
No portrait, generated board, resampling, font or external image is used as a
pixel source. Every silhouette, joint, cloth fold and material cluster is drawn
on the final grid. Re-run with Python 3 + Pillow; output is deterministic.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw
OUT = Path(__file__).resolve().parents[1] / 'assets' / 'pixel'
C = dict(zip('ink edge stone0 stone1 stone2 stone3 stone4 ivory0 ivory1 ivory2 ivory3 gold0 gold1 gold2 gold3 leather0 leather1 leather2 leather3 navy0 navy1 navy2 navy3 navy4 purple0 purple1 purple2 purple3 silver0 silver1 silver2 silver3 skin0 skin1 skin2 skin3 hair0 hair1 hair2 cyan0 cyan1 cyan2 cyan3 ember0 ember1 ember2'.split(),
['#080c16','#111624','#151b2b','#1e2638','#2a3549','#3b485c','#536077','#655f69','#918780','#c1b7a0','#e7dcc0','#5b3e2b','#88603a','#ba8d48','#e4c778','#11151e','#222631','#39404d','#566071','#13182f','#202747','#34365e','#4b4c7e','#6b6797','#231e3b','#3c2c58','#614277','#8b6394','#394559','#66748b','#a2b6c7','#d9e1dc','#624644','#a07463','#ceaa85','#f0d4aa','#1a161e','#30262b','#4b3a36','#164956','#267f8c','#54c9ce','#b5f1df','#733c30','#b7683a','#f1b965']))
PALETTE = list(dict.fromkeys(C.values()))
RGBA = {k: tuple(bytes.fromhex(v[1:]))+(255,) for k,v in C.items()}

def finish(im, file):
    # Explicit palette remap + binary alpha cleanup, even though the redraw
    # already uses only palette entries. Never rescale the source image.
    permitted = {tuple(bytes.fromhex(v[1:])) for v in PALETTE}
    pixels=[]
    raw=im.tobytes()
    for i in range(0,len(raw),4):
        r,g,b,a=raw[i:i+4]
        if a < 128: pixels.append((0,0,0,0)); continue
        rgb=(r,g,b)
        if rgb not in permitted: rgb=min(permitted,key=lambda p:sum((p[i]-rgb[i])**2 for i in range(3)))
        pixels.append((*rgb,255))
    im.putdata(pixels); im.save(OUT/file, optimize=True)

def hero_frame(hero, action, frame):
    attack = action=='attack'; W=128 if attack else 96
    im=Image.new('RGBA',(W,96));d=ImageDraw.Draw(im)
    noah=hero=='noah'; running=action=='run'; air=action.startswith('jump-')
    leaning=action=='jump-running'; land=action=='land'
    bob = [0,-1,0,1][frame%4] if action=='idle' else [0,-1,-2,0,-1,-2][frame%6] if running else 0
    crouch=(7 if frame==0 else 3) if land else 0
    lean=.19 if leaning else .06 if running else .02 if attack and frame in [1,2] else 0
    def pt(x,y): return (round(x+(95-y)*lean),round(y+bob+crouch))
    def poly(points,color,outline='ink'):
        points=[pt(*p) for p in points];d.polygon(points,fill=RGBA[color])
        if outline:d.line(points+[points[0]],fill=RGBA[outline],width=1)
    def line(points,color,width=1): d.line([pt(*p) for p in points],fill=RGBA[color],width=width)
    def dot(x,y,color):d.point(pt(x,y),fill=RGBA[color])
    coat=['navy0','navy1','navy2','navy3'] if noah else ['ivory0','ivory1','ivory2','ivory3']
    trim='silver2' if noah else 'gold2'; light='cyan2' if noah else 'gold3'
    # Back hair, mantle and split coat: authored silhouettes per action.
    wave=[0,1,0,-1][frame%4]
    tail = -5 if running or leaning else wave
    if noah:
        poly([(45,42),(35,47),(31+tail,63),(23+tail,83),(31,79),(30,88),(40,80),(42,84),(50,70),(52,46)],coat[0])
        poly([(37,52),(32,64),(28+tail,79),(36,74),(34,82),(44,70),(44,48)],'purple1',None)
        line([(36,57),(35,66),(30+tail,76)],'purple2');line([(41,48),(39,63),(36,73)],coat[2])
        line([(28+tail,82),(32,79),(30,87)],coat[2]);line([(32,50),(29,61),(32,65)],'navy3')
    else:
        poly([(42,46),(34,51),(34,68),(28+tail,87),(39,83),(42,85),(49,68),(51,48)],coat[0])
        poly([(38,58),(36,72),(32+tail,83),(39,80),(44,64)],coat[2],None)
        line([(35,69),(31+tail,86),(39,82)],'gold1');line([(38,57),(37,70),(35,78)],coat[3])
    # Leg articulation. Foot anchors for grounded states stay exactly at y=95.
    if running:
        legs=[((57,80),(62,95),(36,79),(30,88)),((55,81),(55,95),(34,76),(38,85)),((51,80),(46,95),(38,79),(47,86)),((36,79),(30,88),(57,80),(62,95)),((34,76),(38,85),(55,81),(55,95)),((38,79),(47,86),(51,80),(46,95))][frame]
    elif leaning: legs=[((61,75),(71,85),(36,76),(29,84)),((64,73),(70,82),(35,78),(28,86)),((59,79),(64,93),(39,80),(33,89))][frame]
    elif air: legs=[((59,76),(59,85),(40,78),(39,86)),((61,73),(56,82),(38,75),(41,83)),((54,80),(56,93),(43,80),(42,91))][frame]
    else: legs=((53,80-crouch),(56,95-crouch-bob),(43,79-crouch),(42,95-crouch-bob))
    def leg(hip,knee,foot,far):
        # Chunky connected trousers, tapered shin, steel knee and boot toe.
        poly([(hip-4,63),(hip+4,64),(knee[0]+3,knee[1]),(foot[0]+3,foot[1]-4),(foot[0]+7,foot[1]-2),(foot[0]+7,foot[1]),(foot[0]-4,foot[1]),(knee[0]-4,knee[1])],'leather0' if far else 'leather1')
        line([(hip-1,68),(knee[0]-1,knee[1]-3),(foot[0]-1,foot[1]-5)],'leather2')
        line([(knee[0]-2,knee[1]-1),(knee[0]+2,knee[1])],'silver0' if noah else 'gold0',2)
        line([(foot[0]-2,foot[1]-3),(foot[0]+2,foot[1]-4),(foot[0]+5,foot[1]-2)],'silver1' if noah else 'leather3')
        line([(foot[0]-3,foot[1]),(foot[0]+6,foot[1])],'silver0' if noah else 'gold1')
    leg(44,legs[2],legs[3],True);leg(52,legs[0],legs[1],False)
    # Breastplate/waistcoat, shoulders and the far arm.
    poly([(40,45),(55,44),(60,50),(55,64),(44,68),(38,57)],'leather1')
    poly([(38,46),(32,51),(34,62),(39,66),(42,61),(39,53)],coat[1])
    line([(34,51),(35,58),(38,61)],coat[3],2)
    line([(43,49),(44,60),(52,61)],'leather3');line([(47,48),(52,53),(47,57)],'leather2')
    for y in [51,55,59]:dot(49,y,'silver2' if noah else 'gold2')
    # Front coat: ivory long lapels, or fitted dark silver-trimmed armor.
    if noah:
        poly([(52,46),(58,49),(56,63),(59,73),(53,80),(47,70),(47,60)],'leather2')
        line([(55,49),(52,57),(55,61)],'silver1');line([(48,65),(54,66),(56,74)],'silver2')
        poly([(46,66),(44,73),(46,80),(50,74)],'navy2')
    else:
        poly([(51,43),(59,47),(57,63),(62+wave,84),(54,87),(47,69),(47,56)],coat[2])
        poly([(56,57),(56,67),(60+wave,80),(56,83),(51,67)],coat[1],None)
        line([(53,44),(56,50),(50,56),(51,66),(56,83)],'gold2')
        line([(56,48),(55,52),(51,55)],coat[3]);line([(58,70),(59,77)],coat[3])
        poly([(41,44),(45,48),(43,54),(40,49)],coat[3]);line([(41,44),(44,48),(43,52)],'gold2')
        for y in [71,77,82]:dot(55,y,'gold3')
    # Buckle, strap, knee-length split hem, discrete 1-pixel fittings.
    line([(41,63),(55,64)],'leather0',3);line([(45,64),(50,64)],trim);dot(48,64,light)
    line([(53,47),(43,62)],'leather0',2);line([(53,48),(44,61)],'gold1' if not noah else 'silver0')
    # Head: right-facing profile, visible nose, eye and short hair / deep hood.
    hy=32 if noah else 28
    poly([(48,hy+3),(57,hy+3),(60,hy+8),(63,hy+10),(60,hy+12),(59,hy+16),(51,hy+16),(48,hy+11)],'skin1')
    poly([(53,hy+6),(59,hy+6),(59,hy+10),(61,hy+10),(59,hy+12),(58,hy+15),(54,hy+13)],'skin2',None)
    line([(56,hy+7),(60,hy+7)],'skin0');dot(58,hy+8,'silver3');dot(59,hy+8,'ink');dot(61,hy+10,'skin3');line([(57,hy+13),(59,hy+13)],'skin0')
    if noah:
        # Navy pointed hood, silver seam and long blue-black hair.
        poly([(49,31),(58,33),(62,39),(60,42),(56,37),(51,37),(47,45),(44,51),(41,48),(43,39)],'navy1')
        line([(49,32),(58,35),(60,38)],'navy3');line([(48,36),(55,35),(60,40)],'silver1')
        line([(46,41),(44,47),(46,50)],'navy2',2)
        poly([(49,40),(51,43),(49,51),(42,57),(43,51),(40,54),(42,46)],'navy0')
        line([(47,44),(45,51),(43,54)],'cyan0');line([(48,44),(47,49)],'navy3')
    else:
        poly([(47,31),(50,28),(57,28),(60,31),(60,34),(57,33),(55,36),(52,34),(49,39),(46,37)],'hair0')
        line([(49,31),(52,30),(57,30)],'hair2');line([(48,34),(51,32),(54,32)],'hair1');dot(56,29,'hair2')
        line([(51,37),(50,40)],'hair1')
    # Foreground arm + identity weapon, articulated for the attack / run cycle.
    if attack:
        ends=[(61,60),(77,51),(70,58),(61,62)] if not noah else [(47,43),(73,51),(70,64),(62,63)]
        hand=ends[frame]
    elif running: hand=[(60,60),(58,54),(54,50),(45,54),(46,60),(54,62)][frame]
    elif leaning: hand=(62,53)
    elif air: hand=(60,51)
    else: hand=(61,63)
    poly([(55,47),(60,50),(hand[0]+3,hand[1]-3),(hand[0]+2,hand[1]+2),(hand[0]-3,hand[1]+2),(54,54)],'leather1' if noah else coat[1])
    line([(57,49),(hand[0]-1,hand[1]-1)],'silver1' if noah else coat[3],2)
    poly([(hand[0]-3,hand[1]-5),(hand[0]+2,hand[1]-6),(hand[0]+5,hand[1]-1),(hand[0]+2,hand[1]+2),(hand[0]-2,hand[1]+1)],'silver0' if noah else 'gold1')
    line([(hand[0]-2,hand[1]-4),(hand[0]+2,hand[1]-4),(hand[0]+3,hand[1]-1)],'silver2' if noah else 'gold3')
    dot(hand[0],hand[1]-2,'cyan2');dot(hand[0]+1,hand[1]-2,'cyan3')
    if noah:
        tip=([(29,29),(112,40),(110,78),(84,89)][frame] if attack else (82,88) if not air and not running else (34,64) if leaning else (80,65))
        hilt=(hand[0]+2,hand[1]+1)
        line([hilt,tip],'ink',4);line([hilt,tip],'cyan0',3);line([hilt,tip],'cyan2',1)
        mid=(round((hilt[0]+tip[0])/2),round((hilt[1]+tip[1])/2))
        line([mid,tip],'cyan3');line([(hilt[0]-3,hilt[1]+2),(hilt[0]+4,hilt[1]-3)],'silver2')
        dot(hilt[0]+1,hilt[1],'silver3')
    elif attack and frame==1:
        for r,k in [(7,'cyan0'),(4,'cyan1'),(2,'cyan3')]:
            q=pt(hand[0]+10,hand[1]-2);d.ellipse((q[0]-r,q[1]-r,q[0]+r,q[1]+r),fill=RGBA[k])
        line([(hand[0]+15,hand[1]-2),(hand[0]+20,hand[1]-2)],'cyan2')
    return im

def sheets():
    heroes={}
    for hero,height,width in [('ethan',68,42),('noah',64,39)]:
        animations={}
        for action,n,ticks in [('idle',4,12),('run',6,6),('jump-standing',3,6),('jump-running',3,6),('land',2,4),('attack',4,5)]:
            frames=[hero_frame(hero,action,f) for f in range(n)]
            fw=frames[0].width; sheet=Image.new('RGBA',(fw*n,96))
            for i,im in enumerate(frames):sheet.paste(im,(fw*i,0))
            file=f'{hero}-{action}.png';finish(sheet,file)
            animations[action]=dict(file=file,frameW=fw,frameH=96,frames=n,pivot={'x':48,'y':95},ticks=[ticks]*n,loop=action in ['idle','run'])
        fx='fx-slash' if hero=='noah' else 'fx-rune';n=3 if hero=='noah' else 2;fw=96 if hero=='noah' else 32;fh=64 if hero=='noah' else 32
        sheet=Image.new('RGBA',(fw*n,fh))
        for f in range(n):
            d=ImageDraw.Draw(sheet);ox=f*fw
            if hero=='ethan':
                for points,k in [([(3,16),(12,10-f),(24,13),(29,16),(23,19),(12,22+f)],'cyan0'), ([(8,16),(15,12),(25,15),(28,16),(23,17),(15,20)],'gold2'), ([(12,16),(20,14),(28,16),(20,18)],'cyan3')]:d.polygon([(x+ox,y)for x,y in points],fill=RGBA[k])
                d.point((ox+5-f,12),fill=RGBA['cyan1']);d.point((ox+7,21),fill=RGBA['gold1'])
            else:
                points=[(6,42),(25,13),(57,7+f*3),(83,20),(64,16+f*3),(35,22),(18,43),(10,57)]
                d.polygon([(x+ox,y)for x,y in points],fill=RGBA['cyan0'])
                d.line([(ox+x,y)for x,y in points[:4]],fill=RGBA['cyan2'],width=2)
                d.line([(ox+25,13),(ox+57,7+f*3),(ox+81,19)],fill=RGBA['cyan3'])
        finish(sheet,hero+'-'+fx+'.png');animations[fx]=dict(file=hero+'-'+fx+'.png',frameW=fw,frameH=fh,frames=n,pivot={'x':fw//2,'y':fh//2},ticks=[4]*n,loop=True)
        heroes[hero]={'body':{'w':width,'h':height},'animations':animations}
    return heroes

def tiles():
    im=Image.new('RGBA',(90,30));d=ImageDraw.Draw(im)
    for cell in range(3):
        ox=cell*30;h=16 if cell==2 else 30
        d.rectangle((ox,0,ox+29,h-1),fill=RGBA['stone1'])
        # Offset masonry joints and chipped, lit coping. No gradient dithering.
        for y in [0,10,21]:
            if y>=h:continue
            d.line((ox,y,ox+29,y),fill=RGBA['ink'])
            if y+1<h:d.line((ox+1,y+1,ox+28,y+1),fill=RGBA['stone3'])
            for x in ([7,24] if y==10 else [16]):d.line((ox+x,y,ox+x,min(h-1,y+9)),fill=RGBA['edge'])
        for x,y in [(3,5),(18,7),(25,15),(10,24),(5,19),(22,26)]:
            if y<h:d.line((ox+x,y,ox+x+2,y),fill=RGBA['stone2'])
        if cell in [0,2]:
            d.line((ox,0,ox+29,0),fill=RGBA['stone4']);d.line((ox,1,ox+29,1),fill=RGBA['silver1'])
            for x in [4,13,23]:d.point((ox+x,1),fill=RGBA['silver2'])
            d.line((ox,3,ox+29,3),fill=RGBA['edge'])
    finish(im,'tiles.png')

def background():
    im=Image.new('RGBA',(960,540),RGBA['ink']);d=ImageDraw.Draw(im)
    d.rectangle((0,80,959,539),fill=RGBA['stone0'])
    # Broad quiet masonry keeps the heroes brighter than the room.
    for y in range(90,540,30):
        d.line((0,y,959,y),fill=RGBA['edge'])
        for x in range((y//30%2)*60,960,120):d.line((x,y,x,y+29),fill=RGBA['edge'])
    for x in [75,265,455,645,835]:
        # Original lancet windows, with nested stepped edges at the native grid.
        for inset,color in [(0,'stone2'),(3,'edge'),(7,'navy0')]:
            points=[(x-39+inset,325),(x-39+inset,158),(x-27+inset,132),(x,103+inset),(x+27-inset,132),(x+39-inset,158),(x+39-inset,325)]
            d.polygon(points,fill=RGBA[color])
        d.line([(x,112),(x,321)],fill=RGBA['stone2'],width=3)
        d.line((x-29,214,x+29,214),fill=RGBA['stone2'],width=3)
        d.line((x-29,279,x+29,279),fill=RGBA['stone2'],width=3)
        for wx in [-16,16]:
            d.polygon([(x+wx-6,169),(x+wx,155),(x+wx+6,169),(x+wx,193)],fill=RGBA['navy1'])
            d.line((x+wx,162,x+wx,181),fill=RGBA['stone3'])
    for x in [0,185,375,565,755,945]:
        d.rectangle((x,80,x+14,539),fill=RGBA['edge']);d.rectangle((x+3,90,x+7,539),fill=RGBA['stone2'])
        d.rectangle((x-3,80,x+18,89),fill=RGBA['stone3']);d.line((x-3,80,x+18,80),fill=RGBA['stone4'])
    for x in [202,582,936]:
        d.rectangle((x,331,x+8,336),fill=RGBA['gold0']);d.rectangle((x+3,315,x+5,331),fill=RGBA['ivory1'])
        d.polygon([(x+4,304),(x+1,312),(x+4,316),(x+6,312)],fill=RGBA['ember1']);d.line((x+4,308,x+4,313),fill=RGBA['ember2'])
    finish(im,'bg-chapel.png')

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'palette.json').write_text(json.dumps({'colors':PALETTE},indent=2)+'\n')
    heroes=sheets();tiles();background()
    (OUT/'manifest.json').write_text(json.dumps({'version':1,'tileSize':30,'palette':'palette.json','heroes':heroes,'tiles':{'file':'tiles.png','cells':{'floor-top':[0,0],'wall-fill':[1,0],'ledge':[2,0]}},'background':'bg-chapel.png'},indent=2)+'\n')
    # Review contact sheet is outside the deliverable directory and scaled only
    # for inspection, never used by the runtime or stored as a native asset.
    review=Image.new('RGBA',(768,2*6*104),(15,18,28,255))
    for row,hero in enumerate(['ethan','noah']):
        for col,action in enumerate(['idle','run','jump-standing','jump-running','land','attack']):
            sheet=Image.open(OUT/f'{hero}-{action}.png');review.paste(sheet,(0,row*624+col*104),sheet)
    review.save('/tmp/hollow-keep-pixel-contact.png')
    print(f'Built native RGBA assets, {len(PALETTE)} colors, no source image resampling.')
