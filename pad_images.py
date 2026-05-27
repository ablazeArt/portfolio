import os
from PIL import Image

image_dir = 'public/project-slide-screens-2'
new_dims = {}

for filename in os.listdir(image_dir):
    if not (filename.endswith('.png') or filename.endswith('.jpg')):
        continue
        
    filepath = os.path.join(image_dir, filename)
    img = Image.open(filepath).convert("RGB") # convert to RGB to ensure getpixel works consistently
    w, h = img.size
    
    target_ratio = 4.0 / 3.0
    current_ratio = w / h
    
    new_w, new_h = w, h
    
    if current_ratio > target_ratio:
        # Image is wider than 4:3, increase height
        new_h = int(w / target_ratio)
    elif current_ratio < target_ratio:
        # Image is taller than 4:3, increase width
        new_w = int(h * target_ratio)
    else:
        # Already 4:3
        new_dims[filename] = {"width": w, "height": h}
        continue
        
    # Get top-left pixel color for background padding
    bg_color = img.getpixel((0, 0))
    
    # Create new image with the background color
    new_img = Image.new('RGB', (new_w, new_h), bg_color)
    
    # Paste original image in the center
    paste_x = (new_w - w) // 2
    paste_y = (new_h - h) // 2
    new_img.paste(img, (paste_x, paste_y))
    
    # Save image
    new_img.save(filepath, quality=95)
    
    print(f'"{filename}": {{ width: {new_w}, height: {new_h} }},')
