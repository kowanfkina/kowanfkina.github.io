"""Build responsive website assets from the approved local marketing originals."""
from pathlib import Path
import json, subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('/Users/domino/Documents/GitHub/Domino Image Viewer Plus/DominoImageViewerPlus')
content=json.loads((SOURCE/'宣传物料/AppStore-2026/source/content.json').read_text())
shots=sorted((SOURCE/'宣传物料').glob('Screenshot_*.png'))
for item in content:
    for language,source_key in [('zh','zh-Hans'),('en','en-US')]:
        image=Image.open(shots[item[source_key]['source']]).convert('RGB')
        for width in [640,1280,1920]:
            size=(width,round(image.height*width/image.width))
            image.resize(size,Image.Resampling.LANCZOS).save(ROOT/f'assets/product/{item["id"]}-{language}-{width}.webp',quality=85,method=6)
icon=Image.open(SOURCE/'Assets.xcassets/AppIcon.appiconset/logo.png').convert('RGBA')
icon.resize((128,128),Image.Resampling.LANCZOS).save(ROOT/'assets/product/icon.webp',quality=92)
for language,name in [('zh','中文版'),('en','英文版')]:
    source=Path('/Users/domino/Pictures/AppStore预览压缩版')/f'{name}_AppStore_1080p_30秒_原创配乐.mp4'
    subprocess.run(['ffmpeg','-v','error','-nostdin','-n','-threads','1','-i',str(source),'-vf','scale=1280:720','-c:v','libx264','-preset','slow','-crf','24','-threads','4','-c:a','aac','-b:a','160k','-movflags','+faststart',str(ROOT/f'assets/product/film-{language}.mp4')],check=True)
    subprocess.run(['ffmpeg','-v','error','-nostdin','-n','-threads','1','-ss','4','-i',str(source),'-t','5','-an','-vf','scale=960:540,fps=24','-c:v','libx264','-preset','slow','-crf','25','-threads','4','-movflags','+faststart',str(ROOT/f'assets/product/compare-{language}.mp4')],check=True)
print('Responsive images, two films and two lightweight motion loops prepared.')
