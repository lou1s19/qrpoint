from PIL import Image

def extract_alpha(path):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for r, g, b, a in data:
        # The background is white or light gray. We want it to be transparent.
        # Original shapes are mostly black/gray.
        # Calculate grayscale intensity (0 = black, 255 = white)
        intensity = int(0.299*r + 0.587*g + 0.114*b)
        
        # New alpha: if it was white (255), alpha is 0. If black (0), alpha is 255.
        # But wait, what if original image already had some alpha?
        # The original image was mostly opaque. We combine them.
        new_alpha = int((255 - intensity) * (a / 255.0))
        
        # Output pure black with the new alpha
        new_data.append((0, 0, 0, new_alpha))
        
    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"Extracted alpha for {path}")

# Run on the original extracted images! 
# Oh wait, I overwrote them in the previous step.
