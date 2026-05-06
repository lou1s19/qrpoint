import re
import base64
from PIL import Image
import io

def process_sprite(base64_str, output_path):
    # Decode base64 to image
    img_data = base64.b64decode(base64_str)
    img = Image.open(io.BytesIO(img_data)).convert("RGBA")
    
    data = img.getdata()
    new_data = []
    
    for r, g, b, a in data:
        # If it's fully transparent originally, keep it
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue
            
        # Calculate intensity (0 is black, 255 is white)
        intensity = int(0.299 * r + 0.587 * g + 0.114 * b)
        
        # New alpha: Dark pixels become opaque, white pixels become transparent.
        # But scale by the original alpha just in case.
        new_alpha = int(((255 - intensity) / 255.0) * a)
        
        # Output pure black with the new calculated alpha
        new_data.append((0, 0, 0, new_alpha))
        
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed and saved {output_path}")

with open("QRCode Monkey - QR Code Generator zum erstellen vo.html", "r") as f:
    content = f.read()

# We know the specific file sizes roughly from before, or we can just extract all and pick 7 and 8.
matches = re.findall(r"data:image/png;base64,([a-zA-Z0-9+/=]+)", content)
for i, match in enumerate(matches):
    if len(match) == 76120:  # sprite_7
        process_sprite(match, "assets/images/sprite-body.png")
    elif len(match) == 104928: # sprite_8
        process_sprite(match, "assets/images/sprite-frame-ball.png")

