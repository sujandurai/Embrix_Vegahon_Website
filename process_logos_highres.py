import os
from PIL import Image, ImageEnhance, ImageFilter

def enhance_logo(input_path, output_path, scale_factor=3, sharpen=True):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # High-quality Lanczos upscaling for crisp high-DPI rendering
    new_w, new_h = w * scale_factor, h * scale_factor
    img_large = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    if sharpen:
        # Enhance sharpness for text logos
        enhancer = ImageEnhance.Sharpness(img_large)
        img_large = enhancer.enhance(1.8)
    
    img_large.save(output_path, "PNG", optimize=True)
    print(f"Successfully processed {output_path} ({new_w}x{new_h})")

assets_dir = r"e:\vega_website\assets"

enhance_logo(os.path.join(assets_dir, "bit_horizontal_logo.png"), os.path.join(assets_dir, "bit_horizontal_logo_hd.png"))
enhance_logo(os.path.join(assets_dir, "cdac_official_blue.png"), os.path.join(assets_dir, "cdac_official_blue_hd.png"))
enhance_logo(os.path.join(assets_dir, "vega_official_logo.png"), os.path.join(assets_dir, "vega_official_logo_hd.png"))
