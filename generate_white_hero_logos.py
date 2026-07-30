import os
from PIL import Image, ImageEnhance, ImageOps

assets_dir = r"e:\vega_website\assets"

def make_white_logo(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    img = Image.open(input_path).convert("RGBA")
    
    # Extract alpha channel
    r, g, b, a = img.split()
    
    # Create white image with same alpha
    white_img = Image.new("RGBA", img.size, (255, 255, 255, 255))
    white_img.putalpha(a)
    
    # Upscale 2x for high DPI sharpness
    w, h = white_img.size
    white_hd = white_img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
    
    white_hd.save(output_path, "PNG", optimize=True)
    print(f"Generated white logo: {output_path}")

make_white_logo(os.path.join(assets_dir, "bit_horizontal_logo.png"), os.path.join(assets_dir, "bit_horizontal_logo_white.png"))
make_white_logo(os.path.join(assets_dir, "cdac_official_blue.png"), os.path.join(assets_dir, "cdac_logo_white_hd.png"))
make_white_logo(os.path.join(assets_dir, "vega_official_logo.png"), os.path.join(assets_dir, "vega_logo_white_hd.png"))
