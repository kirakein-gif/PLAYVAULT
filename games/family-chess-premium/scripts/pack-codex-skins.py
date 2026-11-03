"""Review boards from native runtime pieces and real app screenshots."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import sys
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/screenshots/skin-compare';OUT.mkdir(parents=True,exist_ok=True)
fontPath=Path('C:/Windows/Fonts/malgun.ttf')
def font(n):
    return ImageFont.truetype(str(fontPath),n) if fontPath.exists() else ImageFont.load_default(size=n)
def save(im,path):
    im.save(path,'WEBP',lossless=True,method=6)
    assert Image.open(path).convert('RGBA').tobytes()==im.convert('RGBA').tobytes()
for theme in ['medieval','gothic','noble']:
    board=Image.new('RGBA',(1776,730),'#1e232c');d=ImageDraw.Draw(board)
    title={'medieval':'중세 · 방패병 룩과 창을 든 기마 기사','gothic':'고딕 · 차분한 보라색 석상','noble':'노블 · 백석과 흑석의 갑옷 석상'}[theme]
    d.text((32,16),title,font=font(27),fill='#eeeae3')
    for row,c in enumerate(['w','b']):
        y=80+row*320;d.rectangle((0,y,1776,y+318),fill='#35383e' if row==0 else '#a4a6a9')
        for col,(p,label) in enumerate(zip('KQRBNP',['왕','여왕','룩 · 성벽 위 방패병' if theme!='gothic' else '룩','비숍','나이트 · 기마 기사' if theme!='gothic' else '나이트','폰'])):
            x=30+col*288;im=Image.open(ROOT/f'public/skins/{theme}-codex/{c}{p}.webp').convert('RGBA')
            board.alpha_composite(im,(x,y+12));d.text((x+128,y+278),label,font=font(18),fill='#edece8' if row==0 else '#252831',anchor='mm')
    save(board,OUT/(theme+'-lineup.webp'))
    if len(sys.argv)>1:
        export=Path(sys.argv[1]);export.mkdir(parents=True,exist_ok=True)
        board.save(export/(theme+'-lineup.png'))
raw=OUT/'raw'
if raw.exists():
    for theme,left,right,authors in [('medieval','wizard','medieval-codex',['Claude','Codex']),('gothic','gothic','gothic-codex',['Claude','Codex']),('noble','medieval-codex','noble-codex',['Medieval','Noble'])]:
        for vp in ['853x533','1280x800']:
            files=[raw/(left+'-'+vp+'.png'),raw/(right+'-'+vp+'.png')]
            if not all(p.exists() for p in files):continue
            imgs=[Image.open(p).convert('RGBA') for p in files];w=max(im.width for im in imgs);h=max(im.height for im in imgs)
            b=Image.new('RGBA',(w*2,h+48),'#202530');draw=ImageDraw.Draw(b)
            for i,(im,author) in enumerate(zip(imgs,authors)):
                draw.text((i*w+18,10),f'{author} / {theme} / {vp}',font=font(20),fill='#e9e5dd');b.alpha_composite(im,(i*w,48))
            save(b,OUT/(theme+'-compare-'+vp+'.webp'))
    for p in raw.glob('*60px-matrix.png'):save(Image.open(p).convert('RGBA'),OUT/(p.stem+'.webp'))
    if (raw/'observations.json').exists():(OUT/'observations.json').write_bytes((raw/'observations.json').read_bytes())
print('Native piece lineup and available comparisons packed losslessly.')

# Matching floor samples: readable light/dark stone for all three families.
tiles=Image.new('RGB',(1080,450),'#202530');d=ImageDraw.Draw(tiles)
for col,theme in enumerate(['gothic','medieval','noble']):
    d.text((col*360+20,15),{'gothic':'고딕','medieval':'중세','noble':'노블'}[theme],font=font(24),fill='#ebe9e3')
    for row,tone in enumerate(['light','dark']):
        im=Image.open(ROOT/f'public/skins/{theme}-codex/board-{tone}.webp').convert('RGB')
        # Presentation crop only; runtime textures remain1024x1024.
        tiles.paste(im.crop((200,200,520,360)),(col*360+20,60+row*190))
save(tiles.convert('RGBA'),OUT/'floor-materials.webp')
if len(sys.argv)>1:tiles.save(Path(sys.argv[1])/'floor-materials.png')
