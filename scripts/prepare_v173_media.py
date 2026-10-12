"""Export real v1.7.3 screenshots; copy HDR/SDR AVIF originals without re-encoding."""
from pathlib import Path
import argparse
import json
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHOTS = Path('/Users/domino/Desktop/v173 截图')
ORIGINALS = Path('/Users/domino/Desktop/tmp/看图软件的相关材料')
VIDEO = Path('/Users/domino/Desktop/10月11_调色台演示视频_20s/10月11_调色台演示视频_20s.mp4')
OUTPUT = ROOT / 'assets/product/v173'
# Each pair is (English, Chinese); indexes refer to the chronologically sorted originals.
PAIRS = {1:(33,34), 2:(11,12), 3:(41,42), 4:(1,2), 5:(24,23), 6:(15,16),
         7:(18,17), 8:(4,3), 9:(5,6), 10:(19,20), 11:(22,21), 12:(25,26),
         13:(28,27), 14:(29,30), 15:(32,31), 16:(7,8), 17:(10,9), 18:(36,35),
         19:(37,38), 20:(40,39), 21:(14,13)}

def export_roi(manifest):
    """The two added originals live in the repository, independent of clipboard storage."""
    manifest['24'] = {}
    for locale in ('en', 'zh'):
        source = OUTPUT / 'source' / f'roi-{locale}.jpg'
        with Image.open(source) as original:
            image = original.convert('RGB')
            manifest['24'][locale] = {'source':str(source.relative_to(ROOT)), 'width':image.width, 'height':image.height}
            for width in (640,1280,1920):
                image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS).save(
                    OUTPUT/f'24-{locale}-{width}.webp',quality=88,method=6,icc_profile=original.info.get('icc_profile',b''))


def export_grading(manifest):
    """Preserve the supplied console originals and their color profiles."""
    manifest['25'] = {}
    for locale in ('en', 'zh'):
        source = OUTPUT / 'source' / f'grading-{locale}.jpg'
        with Image.open(source) as original:
            image = original.convert('RGB')
            manifest['25'][locale] = {'source':str(source.relative_to(ROOT)), 'width':image.width, 'height':image.height}
            for width in (640,1280,1920):
                image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS).save(
                    OUTPUT/f'25-{locale}-{width}.webp',quality=88,method=6,icc_profile=original.info.get('icc_profile',b''))


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = sorted(SHOTS.glob('*.jpg'))
    if len(paths) != 42:
        raise ValueError('Expected the 42 supplied screenshots.')
    assert sorted(n for pair in PAIRS.values() for n in pair) == list(range(1,43))
    manifest = {}
    for number, pair in PAIRS.items():
        manifest[str(number)] = {}
        for locale, index in zip(('en','zh'), pair):
            source = paths[index-1]
            with Image.open(source) as original:
                image = original.convert('RGB')
                manifest[str(number)][locale] = {'source':source.name,'width':image.width,'height':image.height}
                for width in (640,1280,1920):
                    size = (width, round(image.height * width / image.width))
                    image.resize(size, Image.Resampling.LANCZOS).save(
                        OUTPUT / f'{number}-{locale}-{width}.webp', quality=88, method=6, icc_profile=original.info.get('icc_profile', b''))
    poster_root = Path('/Users/domino/Documents/GitHub/Domino Image Viewer Plus/marketing/app_store_posters/output/storefront')
    for number,name in ((22,'10-crop-resize.png'),(23,'09-batch-rename.png')):
        manifest[str(number)] = {}
        for locale in ('en','zh'):
            with Image.open(poster_root/locale/name) as original:
                image = original.convert('RGB')
                manifest[str(number)][locale] = {'source':'AppStore/'+locale+'/'+name,'width':image.width,'height':image.height}
                for width in (640,1280,1920):
                    image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS).save(
                        OUTPUT/f'{number}-{locale}-{width}.webp',quality=88,method=6,icc_profile=original.info.get('icc_profile',b''))
    for name in ('_DSC0828-1.avif','_DSC0828-1-sdr.avif'):
        shutil.copyfile(ORIGINALS/name, OUTPUT/name)
        assert (ORIGINALS/name).read_bytes() == (OUTPUT/name).read_bytes()
    subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-i',str(VIDEO),
                    '-vf','fps=30','-c:v','libx264','-preset','medium','-crf','23','-threads','4',
                    '-c:a','aac','-b:a','128k','-movflags','+faststart',str(OUTPUT/'grading-demo.mp4')],check=True)
    poster = OUTPUT/'grading-video-poster.jpg'
    subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-ss','5','-i',str(VIDEO),
                    '-frames:v','1',str(poster)],check=True)
    with Image.open(poster) as frame:
        frame.save(OUTPUT/'grading-video-poster.webp',quality=88,method=6)
    poster.unlink()
    export_roi(manifest)
    export_grading(manifest)
    (ROOT/'scripts/media-v173.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('46 screenshots exported; HDR/SDR originals preserved; 20-second video prepared.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--roi-only',action='store_true',help='Export only the two regional-statistics screenshots.')
    mode.add_argument('--grading-only',action='store_true',help='Export only the two new color-grading console screenshots.')
    args = parser.parse_args()
    if args.roi_only or args.grading_only:
        path = ROOT/'scripts/media-v173.json'
        manifest = json.loads(path.read_text())
        (export_grading if args.grading_only else export_roi)(manifest)
        path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
        print('Two originals exported as six responsive images.')
    else:
        main()
