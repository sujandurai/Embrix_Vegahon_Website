import os
from PIL import Image

def process_and_crop(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert("RGBA")
    
    # Convert white background to transparent
    datas = img.getdata()
    new_data = []
    for item in datas:
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # Crop to bounding box of content (removing all empty outer margin)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Scale up 2x with high quality Lanczos
    w, h = img.size
    img_hd = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
    img_hd.save(output_path, "PNG", optimize=True)
    print(f"Successfully processed {output_path} ({w*2}x{h*2})")

assets_dir = r"e:\vega_website\assets"
process_and_crop(os.path.join(assets_dir, "vega_horizontal_official.png"), os.path.join(assets_dir, "vega_horizontal_clean_hd.png"))
