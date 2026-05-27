import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Please install it using: pip install Pillow")
    sys.exit(1)

DIR = "/Users/ablaze/portfolio/public/project-slide-screens-2"
PADDING_COLOR = "#E8EEFE"

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

bg_color = hex_to_rgb(PADDING_COLOR)
bg_color_rgba = bg_color + (255,)

dimensions = {}

for filename in os.listdir(DIR):
    if filename.lower().endswith(".webp"):
        path = os.path.join(DIR, filename)
        try:
            with Image.open(path) as img:
                img = img.convert("RGBA")
                w, h = img.size
                
                target_ratio = 4.0 / 3.0
                current_ratio = w / h
                
                if abs(current_ratio - target_ratio) < 0.01:
                    print(f"Skipping {filename}, already 4:3 (size: {w}x{h})")
                    dimensions[filename] = (w, h)
                    continue
                
                if current_ratio > target_ratio:
                    # Wider than 4:3, add padding top/bottom
                    new_w = w
                    new_h = int(w / target_ratio)
                else:
                    # Taller than 4:3, add padding left/right
                    new_h = h
                    new_w = int(h * target_ratio)
                    
                new_img = Image.new("RGBA", (new_w, new_h), bg_color_rgba)
                
                offset_x = (new_w - w) // 2
                offset_y = (new_h - h) // 2
                
                # Paste using the image itself as a mask to preserve its own alpha if any
                new_img.paste(img, (offset_x, offset_y), img)
                
                # Save as WebP
                # WebP supports RGBA, so we can save it as RGBA if we want, but RGB is fine since background is solid
                new_img.convert("RGB").save(path, "WEBP", quality=95)
                
                print(f"Resized {filename}: {w}x{h} -> {new_w}x{new_h}")
                dimensions[filename] = (new_w, new_h)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("\n--- New Dimensions ---")
for f, (w, h) in dimensions.items():
    print(f"'{f}': {{ width: {w}, height: {h} }},")
