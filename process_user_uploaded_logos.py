import os
from PIL import Image

assets_dir = r"e:\vega_website\assets"

def remove_white_bg(input_path, output_path, threshold=240):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Check if color is near white
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            new_data.append((255, 255, 255, 0)) # Make transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Scale up 2x for sharp rendering
    w, h = img.size
    img_hd = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
    img_hd.save(output_path, "PNG", optimize=True)
    print(f"Saved transparent logo: {output_path}")

remove_white_bg(os.path.join(assets_dir, "bit_logo_uploaded.png"), os.path.join(assets_dir, "bit_logo_uploaded_clean.png"))
remove_white_bg(os.path.join(assets_dir, "vega_logo_uploaded.png"), os.path.join(assets_dir, "vega_logo_uploaded_clean.png"))
remove_white_bg(os.path.join(assets_dir, "cdac_logo_uploaded.png"), os.path.join(assets_dir, "cdac_logo_uploaded_clean.png"))
