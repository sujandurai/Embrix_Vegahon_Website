import os
from PIL import Image

src_path = r"C:\Users\Admin\.gemini\antigravity\brain\8d020675-8f13-4c7f-81cf-a42d8cbf6367\media__1785287658048.png"
dst_path = r"e:\vega_website\assets\bit_logo_zoomed_hd.png"

img = Image.open(src_path).convert("RGBA")

# Crop tight bounding box
gray = img.convert("L")
bbox = Image.eval(gray, lambda p: 255 if p < 245 else 0).getbbox()
print("Original size:", img.size, "Content BBox:", bbox)

if bbox:
    img = img.crop(bbox)

# Convert white background to transparent
datas = img.getdata()
new_data = []
for item in datas:
    if item[0] >= 240 and item[1] >= 240 and item[2] >= 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)

# Scale 2x Lanczos
w, h = img.size
img_hd = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
img_hd.save(dst_path, "PNG", optimize=True)
print("Saved zoomed HD BIT logo:", dst_path, f"({w*2}x{h*2})")
