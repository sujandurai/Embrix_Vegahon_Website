import os
from PIL import Image

src_path = r"C:\Users\Admin\.gemini\antigravity\brain\8d020675-8f13-4c7f-81cf-a42d8cbf6367\media__1785288750754.png"
dst_path = r"e:\vega_website\assets\vega_processor_ref_clean.png"

img = Image.open(src_path).convert("RGBA")
print("Original size:", img.size)

# Convert white / near-white background to transparent
datas = img.getdata()
new_data = []
for item in datas:
    if item[0] >= 235 and item[1] >= 235 and item[2] >= 235:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)
img.putdata(new_data)

# Tight crop to content
bbox = img.getbbox()
print("Content bbox:", bbox)
if bbox:
    img = img.crop(bbox)

# Upscale 2x Lanczos
w, h = img.size
img_hd = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
img_hd.save(dst_path, "PNG", optimize=True)
print(f"Saved {dst_path} ({w*2}x{h*2})")
