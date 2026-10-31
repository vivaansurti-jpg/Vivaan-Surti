from pathlib import Path
import argparse
import html
import re
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

parser = argparse.ArgumentParser(description='Replace the top portrait with theme-aware ASCII.')
parser.add_argument('image', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
image = ImageOps.exif_transpose(Image.open(args.image)).convert('L')
width, height = image.size
image = image.crop((int(width*.12), 0, int(width*.98), int(height*.85)))
image = ImageOps.fit(image, (600, 600))
image = ImageEnhance.Contrast(ImageOps.autocontrast(image, cutoff=1)).enhance(1.12)
image = image.resize((48, 24), Image.Resampling.LANCZOS)
image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=3))
ramp = ' .:-=+*#%@'
def portrait(invert):
    pixels = list(image.getdata())
    chars = [ramp[round((255-p if invert else p)/255*(len(ramp)-1))] for p in pixels]
    return '\n'.join(''.join(chars[i:i+48]) for i in range(0, len(chars), 48))
figure = '<figure class="avatar" aria-hidden="true">' + ''.join(
    '<pre class="ascii-'+theme+'">'+html.escape(portrait(invert))+'</pre>'
    for theme, invert in [('dark', False), ('light', True)]) + '</figure>'
for path in [root/'index.html', root/'foundation/index.html']:
    source = path.read_text()
    source = re.sub(r'<figure class="avatar" aria-hidden="true">.*?</figure>', lambda _: figure, source, flags=re.S)
    source = re.sub(r'  <!-- Replace the initials.*?-->\n', '', source)
    path.write_text(source)
