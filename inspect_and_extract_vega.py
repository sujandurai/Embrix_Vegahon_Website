import os
from PIL import Image

media1 = r"C:\Users\Admin\.gemini\antigravity\brain\8d020675-8f13-4c7f-81cf-a42d8cbf6367\media__1785287035017.png"
media2 = r"C:\Users\Admin\.gemini\antigravity\brain\8d020675-8f13-4c7f-81cf-a42d8cbf6367\media__1785287034972.png"

img1 = Image.open(media1)
img2 = Image.open(media2)

print("Img1 size:", img1.size)
print("Img2 size:", img2.size)

# If img1 is the high-res VEGA logo (1000+ width or square/ratio), let's crop it tightly
# Let's save a cropped clean version of img1
if img1.width > 500:
    # Let's check if img1 is the white background VEGA PROCESSOR logo shown in Photo 2
    # In Photo 2, VEGA PROCESSOR logo spans across the image with a white background!
    # Let's crop away white margins:
    gray = img1.convert("L")
    # threshold for non-white content
    bbox = Image.eval(gray, lambda p: 255 if p < 240 else 0).getbbox()
    print("Img1 content bbox:", bbox)
    if bbox:
        cropped = img1.crop(bbox)
        print("Cropped size:", cropped.size)
        
        # Convert white background to transparent
        cropped_rgba = cropped.convert("RGBA")
        datas = cropped_rgba.getdata()
        new_data = []
        for item in datas:
            if item[0] >= 240 and item[1] >= 240 and item[2] >= 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        cropped_rgba.putdata(new_data)
        
        # Save high res output
        w, h = cropped_rgba.size
        hd_vega = cropped_rgba.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
        hd_vega.save(r"e:\vega_website\assets\vega_processor_clean_zoomed.png", "PNG", optimize=True)
        print("Saved e:\\vega_website\\assets\\vega_processor_clean_zoomed.png")
