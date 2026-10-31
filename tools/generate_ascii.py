from pathlib import Path
import argparse
import html
import re
from PIL import Image, ImageOps, ImageEnhance

parser = argparse.ArgumentParser(description='Replace the top portrait with theme-aware ASCII.')
parser.add_argument('image', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
image = ImageOps.exif_transpose(Image.open(args.image)).convert('L')
width, height = image.size
image = image.crop((int(width*.28), int(height*.01), int(width*.81), int(height*.65)))
image = ImageOps.fit(image, (500, 500))
image = ImageEnhance.Contrast(ImageOps.autocontrast(image, cutoff=2)).enhance(1.35)
image = image.resize((40, 20), Image.Resampling.LANCZOS)
ramp = ' .:-=+*#%@'
def portrait(invert):
    pixels = list(image.getdata())
    chars = [ramp[round((255-p if invert else p)/255*(len(ramp)-1))] for p in pixels]
    return '\n'.join(''.join(chars[i:i+40]) for i in range(0, len(chars), 40))
figure = '<figure class="avatar" aria-hidden="true">' + ''.join(
    '<pre class="ascii-'+theme+'">'+html.escape(portrait(invert))+'</pre>'
    for theme, invert in [('dark', False), ('light', True)]) + '</figure>'
for path in [root/'index.html', root/'foundation/index.html']:
    source = path.read_text()
    source = re.sub(r'<figure class="avatar" aria-hidden="true">.*?</figure>', lambda _: figure, source, flags=re.S)
    source = re.sub(r'  <!-- Replace the initials.*?-->\n', '', source)
    path.write_text(source)
