import os
import sys
from PIL import Image

try:
    import numpy as np
except ImportError:
    print("Numpy not installed.")
    sys.exit(1)

DEST_DIR = "/Users/ablaze/portfolio/public/project-slide-screens-2"

def crop_with_tolerance(img, bg_color, tolerance=25):
    img_rgb = img.convert("RGB")
    data = np.array(img_rgb)
    bg_np = np.array(bg_color)
    
    diff = np.abs(data - bg_np)
    mask = np.any(diff > tolerance, axis=2)
    
    coords = np.argwhere(mask)
    if coords.size == 0:
        return img
        
    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)
    
    return img.crop((x_min, y_min, x_max + 1, y_max + 1))

def pad_to_4_3(img):
    w, h = img.size
    target_ratio = 4.0 / 3.0
    current_ratio = w / h
    
    if abs(current_ratio - target_ratio) < 0.01:
        return img
        
    new_w, new_h = w, h
    if current_ratio > target_ratio:
        new_h = int(w / target_ratio)
    else:
        new_w = int(h * target_ratio)
        
    img_rgb = img.convert("RGB")
    bg_color = img_rgb.getpixel((0, 0))
    
    new_img = Image.new('RGB', (new_w, new_h), bg_color)
    
    paste_x = (new_w - w) // 2
    paste_y = (new_h - h) // 2
    
    if img.mode == 'RGBA':
        new_img.paste(img, (paste_x, paste_y), img)
    else:
        new_img.paste(img, (paste_x, paste_y))
        
    return new_img

dimensions = {}

for filename in os.listdir(DEST_DIR):
    if not filename.endswith(".webp"):
        continue
        
    path = os.path.join(DEST_DIR, filename)
    try:
        with Image.open(path) as img:
            # 1. Strip the old #E8EEFE padding (RGB: 232, 238, 254)
            # This handles cases where my first script added #E8EEFE padding.
            cropped = crop_with_tolerance(img, (232, 238, 254), tolerance=20)
            
            # 2. Re-pad to 4:3 using its OWN top-left pixel color
            padded = pad_to_4_3(cropped)
            
            # 3. Scale up to 1440x1080 for uniformity if it's smaller, or just save?
            # It's better to scale to a standard size like 1440x1080 for high resolution
            final_img = padded.resize((1440, 1080), Image.Resampling.LANCZOS)
            
            final_img.save(path, "WEBP", quality=95)
            print(f"Processed {filename} -> cropped {cropped.size} -> final {final_img.size}")
            dimensions[filename] = final_img.size
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("\n--- New Dimensions ---")
for f, (w, h) in dimensions.items():
    print(f"'{f}': {{ width: {w}, height: {h} }},")
